import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadows } from '../../src/design-system';
import { useBuyerStore } from '../../src/stores/buyer';

// ─── math ─────────────────────────────────────────────────────────────────────

function calcPI(principal: number, annualRatePct: number, years: number): number {
  if (principal <= 0 || annualRatePct <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}
const calcTax = (price: number, pct = 0.6) => (price * pct) / 100 / 12;
const calcIns = (price: number) => (price * 0.5) / 100 / 12;
const calcPMI = (loan: number) => (loan * 0.8) / 100 / 12;
const calcMIP = (loan: number) => (loan * 0.85) / 100 / 12;

function parseNum(s: string): number {
  const n = parseFloat(s.replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}
const fmt = (n: number) => '$' + Math.round(Math.abs(n)).toLocaleString();
const fmtSigned = (n: number) => (n >= 0 ? '+' : '-') + fmt(n);

// ─── constants ────────────────────────────────────────────────────────────────

const AZ_TAX_RATE = 0.6;

const STATE_RATES: [string, number][] = [
  ['California', 0.75], ['Texas', 1.80], ['Illinois', 2.30], ['New York', 1.40],
  ['New Jersey', 2.10], ['Florida', 0.89], ['Colorado', 0.52], ['Washington', 0.93],
  ['Georgia', 0.92], ['N. Carolina', 0.77], ['Virginia', 0.87], ['Ohio', 1.41],
  ['Michigan', 1.44], ['Pennsylvania', 1.49], ['Nevada', 0.59], ["Nat'l Avg", 1.07],
];

const BAH_BY_BASE: Record<string, number> = {
  luke: 2100, huachuca: 1800, dm: 1950, veteran_retired: 2100,
};

type Mode = 'veteran' | 'first_time' | 'relocation' | 'senior';

const MODES: { key: Mode; label: string; icon: string }[] = [
  { key: 'veteran',    label: 'Veteran',    icon: 'shield'   },
  { key: 'first_time', label: 'First-Time', icon: 'home'     },
  { key: 'relocation', label: 'Relocation', icon: 'airplane' },
  { key: 'senior',     label: '55+',        icon: 'sunny'    },
];

// ─── shared sub-components ────────────────────────────────────────────────────

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: { v: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.v}
          onPress={() => onChange(o.v)}
          style={[pill.base, value === o.v && pill.active]}
        >
          <Text style={[pill.text, value === o.v && pill.activeText]}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const pill = StyleSheet.create({
  base: {
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 100,
    borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.backgroundSecondary,
  },
  active: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  text: { fontSize: FontSize.xs, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  activeText: { color: Colors.white },
});

function NumInput({
  label, value, onChange, prefix, suffix,
}: {
  label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string;
}) {
  return (
    <View style={ni.row}>
      <Text style={ni.label}>{label}</Text>
      <View style={ni.wrap}>
        {prefix ? <Text style={ni.affix}>{prefix}</Text> : null}
        <TextInput
          style={ni.input}
          value={value}
          onChangeText={onChange}
          keyboardType="decimal-pad"
          selectTextOnFocus
          returnKeyType="done"
        />
        {suffix ? <Text style={ni.affix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const ni = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textPrimary, flex: 1, paddingRight: 8 },
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  input: {
    fontSize: FontSize.md, fontWeight: FontWeight.semibold,
    color: Colors.textPrimary, textAlign: 'right', minWidth: 72, padding: 0,
  },
  affix: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
});

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity onPress={onToggle}>
      <View style={[tog.track, on && tog.trackOn]}>
        <View style={[tog.thumb, on && tog.thumbOn]} />
      </View>
    </TouchableOpacity>
  );
}
const tog = StyleSheet.create({
  track: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border, justifyContent: 'center', padding: 2 },
  trackOn: { backgroundColor: Colors.success },
  thumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white },
  thumbOn: { alignSelf: 'flex-end' },
});

function LineRow({
  label, value, color, bold, dividerAbove,
}: {
  label: string; value: string; color?: string; bold?: boolean; dividerAbove?: boolean;
}) {
  return (
    <>
      {dividerAbove && <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 6 }} />}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
        <Text style={{ fontSize: 13, color: bold ? Colors.textPrimary : Colors.textSecondary, fontWeight: bold ? '600' : '400' }}>
          {label}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: bold ? '700' : '500', color: color ?? (bold ? Colors.textPrimary : Colors.textSecondary) }}>
          {value}
        </Text>
      </View>
    </>
  );
}

function InputCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={card.wrap}>
      <Text style={card.title}>{title}</Text>
      {children}
    </View>
  );
}

function ResultsCard({ title, children, total }: { title: string; children: React.ReactNode; total: string }) {
  return (
    <View style={rs.wrap}>
      <Text style={rs.header}>{title}</Text>
      <View style={rs.body}>{children}</View>
      <View style={rs.totalRow}>
        <Text style={rs.totalLabel}>Total Monthly</Text>
        <Text style={rs.totalValue}>{total}</Text>
      </View>
    </View>
  );
}

function InsightCard({
  icon, color, title, children,
}: {
  icon: string; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <View style={[card.wrap, ins.wrap]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Ionicons name={icon as any} size={16} color={color} />
        <Text style={[card.title, { color }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.backgroundCard,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 14, padding: 16,
    ...(Shadows.sm as object),
  },
  title: {
    fontSize: 11, fontWeight: FontWeight.bold, color: Colors.textSecondary,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8,
  },
});

const rs = StyleSheet.create({
  wrap: {
    marginHorizontal: 16, marginTop: 12, borderRadius: 14,
    overflow: 'hidden', borderWidth: 1, borderColor: Colors.primary + '25',
    ...(Shadows.md as object),
  },
  header: {
    backgroundColor: Colors.primary, color: 'rgba(255,255,255,0.8)',
    fontSize: 11, fontWeight: '700', letterSpacing: 1,
    textTransform: 'uppercase', paddingHorizontal: 16, paddingVertical: 10,
  },
  body: { backgroundColor: Colors.backgroundCard, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  totalRow: {
    backgroundColor: Colors.primary + '10', borderTopWidth: 1.5,
    borderTopColor: Colors.primary + '30', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  totalLabel: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary },
  totalValue: { fontSize: 24, fontWeight: '800', color: Colors.primary },
});

const ins = StyleSheet.create({
  wrap: { backgroundColor: Colors.supportGoldLight, borderWidth: 1, borderColor: Colors.accent + '40' },
});

// ─── main ─────────────────────────────────────────────────────────────────────

export default function CalculatorScreen() {
  const { buyer } = useBuyerStore();

  const [mode, setMode] = useState<Mode>((buyer?.buyer_type as Mode) ?? 'veteran');

  // shared
  const [homePrice, setHomePrice] = useState('400000');
  const [rate,      setRate]      = useState('6.75');
  const [term,      setTerm]      = useState('30');

  // veteran
  const defaultBah = buyer?.military_base ? String(BAH_BY_BASE[buyer.military_base] ?? 2100) : '2100';
  const [bah,      setBah]      = useState(defaultBah);
  const [feeExempt, setFeeExempt] = useState(false);

  // first-time
  const [loanType, setLoanType] = useState('fha');
  const [downPct,  setDownPct]  = useState('3.5');
  const [dpaPct,   setDpaPct]   = useState('0');

  // relocation
  const [relDown,    setRelDown]    = useState('10');
  const [fromState,  setFromState]  = useState('California');

  // senior
  const [srDown,      setSrDown]      = useState('20');
  const [income,      setIncome]      = useState('5000');
  const [includeHoa,  setIncludeHoa]  = useState(true);
  const [hoa,         setHoa]         = useState('250');

  // ── veteran ──
  const vet = useMemo(() => {
    const price = parseNum(homePrice);
    const r     = parseNum(rate);
    const yr    = parseNum(term);
    const bahN  = parseNum(bah);
    const loan  = price;
    const piAmt = calcPI(loan, r, yr);
    const taxAmt = calcTax(price, AZ_TAX_RATE);
    const insAmt = calcIns(price);
    const total  = piAmt + taxAmt + insAmt;
    const surplus = bahN - total;
    const coverPct = bahN > 0 ? Math.min(100, Math.round((total / bahN) * 100)) : 0;
    const pmiSaved = calcPMI(loan);
    const fundingFee = feeExempt ? 0 : loan * 0.0215;
    return { price, loan, piAmt, taxAmt, insAmt, total, bahN, surplus, coverPct, pmiSaved, fundingFee };
  }, [homePrice, rate, term, bah, feeExempt]);

  // ── first-time ──
  const ft = useMemo(() => {
    const price  = parseNum(homePrice);
    const r      = parseNum(rate);
    const yr     = parseNum(term);
    const dpN    = parseNum(downPct);
    const dpaN   = parseNum(dpaPct);
    const downAmt = price * dpN / 100;
    const loan   = price - downAmt;
    const dpaAmt = dpaN > 0 ? loan * dpaN / 100 : 0;
    const oop    = Math.max(0, downAmt - dpaAmt);
    const piAmt  = calcPI(loan, r, yr);
    const mi     = loanType === 'fha' ? calcMIP(loan) : dpN < 20 ? calcPMI(loan) : 0;
    const miLabel = loanType === 'fha' ? 'FHA MIP' : 'PMI';
    const taxAmt = calcTax(price, AZ_TAX_RATE);
    const insAmt = calcIns(price);
    const total  = piAmt + mi + taxAmt + insAmt;
    return { price, downAmt, loan, dpaAmt, oop, piAmt, mi, miLabel, taxAmt, insAmt, total };
  }, [homePrice, rate, term, downPct, loanType, dpaPct]);

  // ── relocation ──
  const rel = useMemo(() => {
    const price   = parseNum(homePrice);
    const r       = parseNum(rate);
    const yr      = parseNum(term);
    const dpN     = parseNum(relDown);
    const down    = price * dpN / 100;
    const loan    = price - down;
    const piAmt   = calcPI(loan, r, yr);
    const azTax   = calcTax(price, AZ_TAX_RATE);
    const insAmt  = calcIns(price);
    const total   = piAmt + azTax + insAmt;
    const stRate  = STATE_RATES.find(([s]) => s === fromState)?.[1] ?? 1.07;
    const stTax   = calcTax(price, stRate);
    const mthSave = stTax - azTax;
    const yrSave  = mthSave * 12;
    return { down, loan, piAmt, azTax, insAmt, total, stRate, stTax, mthSave, yrSave };
  }, [homePrice, rate, term, relDown, fromState]);

  // ── senior ──
  const sr = useMemo(() => {
    const price   = parseNum(homePrice);
    const r       = parseNum(rate);
    const yr      = parseNum(term);
    const dpN     = parseNum(srDown);
    const down    = price * dpN / 100;
    const loan    = price - down;
    const piAmt   = calcPI(loan, r, yr);
    const taxAmt  = calcTax(price, AZ_TAX_RATE);
    const insAmt  = calcIns(price);
    const hoaAmt  = includeHoa ? parseNum(hoa) : 0;
    const total   = piAmt + taxAmt + insAmt + hoaAmt;
    const incN    = parseNum(income);
    const ratio   = incN > 0 ? Math.round((total / incN) * 100) : 0;
    const leftover = incN - total;
    const azSave  = calcTax(price, 1.07) - calcTax(price, AZ_TAX_RATE);
    return { down, loan, piAmt, taxAmt, insAmt, hoaAmt, total, incN, ratio, leftover, azSave };
  }, [homePrice, rate, term, srDown, income, includeHoa, hoa]);

  const ratioColor = sr.ratio <= 28 ? Colors.success : sr.ratio <= 36 ? Colors.accent : Colors.danger;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          style={s.scroll}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={s.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Ionicons name="calculator" size={24} color={Colors.accent} />
              <Text style={s.headerTitle}>Payment Power</Text>
            </View>
            <Text style={s.headerSub}>Personalized home payment calculator</Text>
          </View>

          {/* Mode selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.modeRow}>
            {MODES.map((m) => (
              <TouchableOpacity
                key={m.key}
                onPress={() => setMode(m.key)}
                style={[s.modeBtn, mode === m.key && s.modeBtnActive]}
              >
                <Ionicons name={m.icon as any} size={16} color={mode === m.key ? Colors.primary : 'rgba(255,255,255,0.65)'} />
                <Text style={[s.modeTxt, mode === m.key && s.modeTxtActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* ═══════════ VETERAN ═══════════ */}
          {mode === 'veteran' && (
            <>
              <InputCard title="VA Loan Details">
                <NumInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" />
                <NumInput label="Interest Rate" value={rate} onChange={setRate} suffix="%" />
                <View style={s.inlineRow}>
                  <Text style={ni.label}>Loan Term</Text>
                  <PillGroup
                    options={[{ v: '15', label: '15 yr' }, { v: '30', label: '30 yr' }]}
                    value={term} onChange={setTerm}
                  />
                </View>
                <NumInput label="Monthly BAH" value={bah} onChange={setBah} prefix="$" />
                <View style={s.inlineRow}>
                  <Text style={ni.label}>P&T Disabled (fee exempt)</Text>
                  <Toggle on={feeExempt} onToggle={() => setFeeExempt(!feeExempt)} />
                </View>
              </InputCard>

              <ResultsCard title="VA Monthly Breakdown" total={fmt(vet.total)}>
                <LineRow label="Principal & Interest" value={fmt(vet.piAmt)} />
                <LineRow label="Est. Property Tax (AZ 0.6%)" value={fmt(vet.taxAmt)} />
                <LineRow label="Est. Homeowner's Insurance" value={fmt(vet.insAmt)} />
                <LineRow label="PMI" value="$0  ·  VA Benefit" color={Colors.success} />
              </ResultsCard>

              {/* BAH vs Payment */}
              <View style={[card.wrap, { borderWidth: 1.5, borderColor: vet.surplus >= 0 ? Colors.success : Colors.danger }]}>
                <Text style={card.title}>BAH vs. Monthly Payment</Text>
                <LineRow label="Your Monthly BAH" value={fmt(vet.bahN)} bold />
                <LineRow label="Total Housing Cost" value={fmt(vet.total)} />
                <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 8 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.textPrimary }}>
                    {vet.surplus >= 0 ? 'Monthly Surplus' : 'Monthly Shortfall'}
                  </Text>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: vet.surplus >= 0 ? Colors.success : Colors.danger }}>
                    {vet.surplus >= 0 ? '+' : '-'}{fmt(vet.surplus)}
                  </Text>
                </View>
                <View style={s.bar}>
                  <View style={[s.barFill, {
                    width: `${vet.coverPct}%`,
                    backgroundColor: vet.coverPct <= 100 ? Colors.success : Colors.danger,
                  }]} />
                </View>
                <Text style={s.barLabel}>BAH covers {vet.coverPct}% of your monthly payment</Text>
              </View>

              {/* VA savings */}
              <View style={[card.wrap, { backgroundColor: Colors.supportMilitaryBlue }]}>
                <Text style={[card.title, { color: Colors.primary }]}>Your VA Benefit Saves</Text>
                {[
                  `$0 Down Payment — saves ${fmt(vet.price * 0.05)} vs 5% conventional`,
                  `No PMI — saves ${fmt(vet.pmiSaved)}/mo (${fmt(vet.pmiSaved * 12)}/yr)`,
                  feeExempt ? `Funding Fee Exempt — saves ${fmt(vet.fundingFee)} upfront` : null,
                ].filter(Boolean).map((txt, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 }}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={{ fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 }}>{txt}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ═══════════ FIRST-TIME ═══════════ */}
          {mode === 'first_time' && (
            <>
              <InputCard title="Loan Details">
                <NumInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" />
                <View style={s.inlineRow}>
                  <Text style={ni.label}>Loan Type</Text>
                  <PillGroup
                    options={[{ v: 'fha', label: 'FHA' }, { v: 'conventional', label: 'Conventional' }]}
                    value={loanType} onChange={setLoanType}
                  />
                </View>
                <View style={s.inlineRow}>
                  <Text style={ni.label}>Down Payment</Text>
                  <PillGroup
                    options={
                      loanType === 'fha'
                        ? [{ v: '3.5', label: '3.5%' }, { v: '5', label: '5%' }, { v: '10', label: '10%' }]
                        : [{ v: '3', label: '3%' }, { v: '5', label: '5%' }, { v: '10', label: '10%' }, { v: '20', label: '20%' }]
                    }
                    value={downPct} onChange={setDownPct}
                  />
                </View>
                <View style={s.inlineRow}>
                  <Text style={ni.label}>AZ Down Payment Assistance</Text>
                  <PillGroup
                    options={[
                      { v: '0', label: 'None' },
                      { v: '3', label: 'Home Plus 3%' },
                      { v: '5', label: 'Home Plus 5%' },
                      { v: '4', label: 'Pima/Tucson 4%' },
                    ]}
                    value={dpaPct} onChange={setDpaPct}
                  />
                </View>
                <NumInput label="Interest Rate" value={rate} onChange={setRate} suffix="%" />
                <View style={s.inlineRow}>
                  <Text style={ni.label}>Loan Term</Text>
                  <PillGroup
                    options={[{ v: '15', label: '15 yr' }, { v: '30', label: '30 yr' }]}
                    value={term} onChange={setTerm}
                  />
                </View>
              </InputCard>

              <ResultsCard title="Monthly Breakdown" total={fmt(ft.total)}>
                {parseFloat(dpaPct) > 0 && (
                  <>
                    <LineRow label="Down Payment Required" value={fmt(ft.downAmt)} />
                    <LineRow
                      label={`${dpaPct === '4' ? 'Pima/Tucson' : 'Home Plus'} ${dpaPct}% DPA Grant`}
                      value={`-${fmt(ft.dpaAmt)}`}
                      color={Colors.success}
                    />
                    <LineRow label="Your Out-of-Pocket" value={fmt(ft.oop)} bold />
                    <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 6 }} />
                  </>
                )}
                <LineRow label="Loan Amount" value={fmt(ft.loan)} />
                <LineRow label="Principal & Interest" value={fmt(ft.piAmt)} />
                {ft.mi > 0 && <LineRow label={ft.miLabel} value={fmt(ft.mi)} />}
                <LineRow label="Est. Property Tax (AZ 0.6%)" value={fmt(ft.taxAmt)} />
                <LineRow label="Est. Homeowner's Insurance" value={fmt(ft.insAmt)} />
              </ResultsCard>

              {parseFloat(dpaPct) > 0 && (
                <InsightCard icon="sparkles" color={Colors.accent} title="DPA Advantage">
                  <Text style={{ fontSize: 13, color: Colors.textPrimary, lineHeight: 22 }}>
                    The {dpaPct === '4' ? 'Pima/Tucson' : 'Home Plus'} {dpaPct}% program gives you{' '}
                    <Text style={{ fontWeight: '700' }}>{fmt(ft.dpaAmt)}</Text> in assistance
                    {ft.dpaAmt >= ft.downAmt
                      ? `, covering your full down payment with ${fmt(ft.dpaAmt - ft.downAmt)} left for closing costs.`
                      : `, cutting your out-of-pocket from ${fmt(ft.downAmt)} down to just ${fmt(ft.oop)}.`}
                  </Text>
                </InsightCard>
              )}
            </>
          )}

          {/* ═══════════ RELOCATION ═══════════ */}
          {mode === 'relocation' && (
            <>
              <InputCard title="Loan Details">
                <NumInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" />
                <View style={s.inlineRow}>
                  <Text style={ni.label}>Down Payment</Text>
                  <PillGroup
                    options={[
                      { v: '10', label: '10%' }, { v: '15', label: '15%' },
                      { v: '20', label: '20%' }, { v: '25', label: '25%' },
                    ]}
                    value={relDown} onChange={setRelDown}
                  />
                </View>
                <NumInput label="Interest Rate" value={rate} onChange={setRate} suffix="%" />
                <View style={s.inlineRow}>
                  <Text style={ni.label}>Loan Term</Text>
                  <PillGroup
                    options={[{ v: '15', label: '15 yr' }, { v: '30', label: '30 yr' }]}
                    value={term} onChange={setTerm}
                  />
                </View>
                <View style={{ paddingVertical: 10 }}>
                  <Text style={ni.label}>Moving From</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {STATE_RATES.map(([st]) => (
                        <TouchableOpacity
                          key={st}
                          onPress={() => setFromState(st)}
                          style={[pill.base, fromState === st && pill.active]}
                        >
                          <Text style={[pill.text, fromState === st && pill.activeText]}>{st}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              </InputCard>

              <ResultsCard title="Your AZ Monthly Payment" total={fmt(rel.total)}>
                <LineRow label="Loan Amount" value={fmt(rel.loan)} />
                <LineRow label="Principal & Interest" value={fmt(rel.piAmt)} />
                <LineRow label="AZ Property Tax (0.6%/yr)" value={fmt(rel.azTax)} color={Colors.success} />
                <LineRow label="Est. Homeowner's Insurance" value={fmt(rel.insAmt)} />
              </ResultsCard>

              {/* Tax comparison */}
              <View style={[card.wrap, { backgroundColor: Colors.supportMilitaryBlue }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Ionicons name="trending-down" size={16} color={Colors.success} />
                  <Text style={[card.title, { color: Colors.primary }]}>AZ Tax Advantage vs {fromState}</Text>
                </View>
                <LineRow label={`${fromState} (${rel.stRate.toFixed(2)}%/yr)`} value={fmt(rel.stTax) + '/mo'} />
                <LineRow label="Arizona (0.60%/yr)" value={fmt(rel.azTax) + '/mo'} color={Colors.success} />
                <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 8 }} />
                {rel.mthSave > 0 ? (
                  <>
                    <LineRow label="Monthly Savings in AZ" value={`+${fmt(rel.mthSave)}/mo`} color={Colors.success} bold />
                    <LineRow label="Annual Tax Savings" value={`+${fmt(rel.yrSave)}/yr`} color={Colors.success} bold />
                    <LineRow label="5-Year Savings" value={`+${fmt(rel.yrSave * 5)}`} color={Colors.success} bold />
                  </>
                ) : (
                  <LineRow label="AZ has competitive tax rates" value="✓" color={Colors.success} />
                )}
              </View>
            </>
          )}

          {/* ═══════════ SENIOR ═══════════ */}
          {mode === 'senior' && (
            <>
              <InputCard title="Home & Income">
                <NumInput label="Home Price" value={homePrice} onChange={setHomePrice} prefix="$" />
                <View style={s.inlineRow}>
                  <Text style={ni.label}>Down Payment</Text>
                  <PillGroup
                    options={[
                      { v: '20', label: '20%' }, { v: '25', label: '25%' },
                      { v: '30', label: '30%' }, { v: '40', label: '40%' },
                    ]}
                    value={srDown} onChange={setSrDown}
                  />
                </View>
                <NumInput label="Interest Rate" value={rate} onChange={setRate} suffix="%" />
                <View style={s.inlineRow}>
                  <Text style={ni.label}>Loan Term</Text>
                  <PillGroup
                    options={[{ v: '15', label: '15 yr' }, { v: '30', label: '30 yr' }]}
                    value={term} onChange={setTerm}
                  />
                </View>
                <NumInput label="Monthly Income" value={income} onChange={setIncome} prefix="$" />
                <View style={[s.inlineRow, { borderBottomWidth: 0 }]}>
                  <Text style={ni.label}>Include HOA</Text>
                  <Toggle on={includeHoa} onToggle={() => setIncludeHoa(!includeHoa)} />
                </View>
                {includeHoa && (
                  <NumInput label="Monthly HOA" value={hoa} onChange={setHoa} prefix="$" />
                )}
              </InputCard>

              <ResultsCard title="Monthly Breakdown" total={fmt(sr.total)}>
                <LineRow label="Loan Amount" value={fmt(sr.loan)} />
                <LineRow label="Principal & Interest" value={fmt(sr.piAmt)} />
                <LineRow label="Est. Property Tax (AZ 0.6%)" value={fmt(sr.taxAmt)} />
                <LineRow label="Est. Homeowner's Insurance" value={fmt(sr.insAmt)} />
                {includeHoa && <LineRow label="HOA" value={fmt(sr.hoaAmt)} />}
              </ResultsCard>

              {/* Cash flow */}
              <View style={[card.wrap, { borderWidth: 1.5, borderColor: ratioColor }]}>
                <Text style={card.title}>Cash Flow Analysis</Text>
                <LineRow label="Monthly Income" value={fmt(sr.incN)} bold />
                <LineRow label="Total Housing Costs" value={fmt(sr.total)} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.textPrimary }}>Housing Ratio</Text>
                  <View style={[s.ratioBadge, { backgroundColor: ratioColor }]}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.white }}>{sr.ratio}%</Text>
                  </View>
                </View>
                <View style={s.bar}>
                  <View style={[s.barFill, { width: `${Math.min(100, sr.ratio)}%`, backgroundColor: ratioColor }]} />
                  <View style={s.mark28} />
                </View>
                <Text style={s.barLabel}>Lender guideline: ≤28%  ·  Ideal: leaves room for life</Text>
                <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 8 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.textPrimary }}>After Housing</Text>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: sr.leftover >= 0 ? Colors.success : Colors.danger }}>
                    {fmt(sr.leftover)}/mo
                  </Text>
                </View>
              </View>

              {/* AZ senior advantages */}
              <InsightCard icon="sunny" color={Colors.accent} title="AZ Senior Advantages">
                {[
                  `AZ property tax (0.6%) saves ${fmt(sr.azSave)}/mo vs. national average`,
                  '55+ communities include pools, fitness & lawn care in HOA',
                  'P&T disabled veterans may qualify for 100% property tax exemption',
                ].map((txt, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 }}>
                    <Ionicons name="checkmark-circle" size={15} color={Colors.success} />
                    <Text style={{ fontSize: 13, color: Colors.textPrimary, flex: 1, lineHeight: 20 }}>{txt}</Text>
                  </View>
                ))}
              </InsightCard>
            </>
          )}

          <Text style={s.disclaimer}>
            Estimates only. Actual rates, taxes, insurance, and HOA fees vary. Consult a licensed lender for exact figures.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.backgroundSecondary },
  scroll: { flex: 1 },
  content: { paddingBottom: 48 },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.xl,
  },
  headerTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.white },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

  modeRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 8, backgroundColor: Colors.primary },
  modeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 100, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  modeBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  modeTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: 'rgba(255,255,255,0.7)' },
  modeTxtActive: { color: Colors.primary },

  inlineRow: {
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },

  bar: { height: 8, backgroundColor: Colors.border, borderRadius: 4, marginTop: 10, overflow: 'hidden', position: 'relative' },
  barFill: { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 4 },
  barLabel: { fontSize: 11, color: Colors.textSecondary, marginTop: 4 },
  mark28: { position: 'absolute', left: '28%', top: 0, bottom: 0, width: 2, backgroundColor: Colors.textSecondary, opacity: 0.4 },

  ratioBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100 },

  disclaimer: {
    fontSize: 11, color: Colors.textSecondary, textAlign: 'center',
    marginHorizontal: 16, marginTop: 20, lineHeight: 17, fontStyle: 'italic',
  },
});
