const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const GUARD = '# NBC_ATOMIC_FIX';

const ATOMIC_FIX_CONTENT = `#pragma once
#ifdef __cplusplus

// Include order matters:
//   <memory>     — declares atomic_load/store/etc. as C++ inline functions
//                  for shared_ptr; must arrive before <stdatomic.h> macros.
//   <atomic>     — wins the include-order race vs <stdatomic.h>.
//                  <atomic> also defines global-namespace atomic_load/store/etc.
//                  for std::atomic<T>* — no need for us to re-declare those.
//   <stdatomic.h>— now safe; its macros shadow <memory>'s already-declared
//                  functions without breaking them.
#include <memory>
#include <atomic>
#include <stdatomic.h>

// Undo C macros that conflict with C++ qualified names.
// clang/17's stdatomic.h defines these unconditionally in C++ mode and the
// preprocessor expands them even inside std::foo(...) calls.
// After undef, the global-namespace functions already declared by <atomic>
// handle std::atomic<T>* calls; our explicit overloads below handle _Atomic T*.
#ifdef atomic_thread_fence
#  undef atomic_thread_fence
#endif
#ifdef atomic_signal_fence
#  undef atomic_signal_fence
#endif
#ifdef atomic_load
#  undef atomic_load
#endif
#ifdef atomic_store
#  undef atomic_store
#endif
#ifdef atomic_fetch_or
#  undef atomic_fetch_or
#endif
#ifdef atomic_fetch_and
#  undef atomic_fetch_and
#endif

// ── Explicit overloads for _Atomic T* and volatile _Atomic T* ─────────────
// <atomic> already provides global-namespace atomic_load/store/fetch_or/fetch_and
// for std::atomic<T>* — those need no help from us.
//
// Clang C++ CANNOT deduce T from _Atomic T* in template argument deduction
// (_Atomic is a C qualifier, invisible to C++ templates). We must provide
// explicit non-template overloads for each primitive type React Native uses.
//
// Two overloads per operation: non-volatile and volatile.
// REANodesManager.mm declares fields as 'volatile atomic_bool', producing
// 'volatile _Atomic(bool)*' — passing that to a non-volatile overload would
// silently discard the qualifier, which C++ rejects.
#define NBC_C11_ATOMIC_OPS(T) \\
  inline T    atomic_load(_Atomic T* p) noexcept { \\
    return __c11_atomic_load(p, __ATOMIC_SEQ_CST); } \\
  inline T    atomic_load(volatile _Atomic T* p) noexcept { \\
    return __c11_atomic_load(p, __ATOMIC_SEQ_CST); } \\
  inline void atomic_store(_Atomic T* p, T v) noexcept { \\
    __c11_atomic_store(p, v, __ATOMIC_SEQ_CST); } \\
  inline void atomic_store(volatile _Atomic T* p, T v) noexcept { \\
    __c11_atomic_store(p, v, __ATOMIC_SEQ_CST); } \\
  inline T    atomic_fetch_or(_Atomic T* p, T v) noexcept { \\
    return __c11_atomic_fetch_or(p, v, __ATOMIC_SEQ_CST); } \\
  inline T    atomic_fetch_or(volatile _Atomic T* p, T v) noexcept { \\
    return __c11_atomic_fetch_or(p, v, __ATOMIC_SEQ_CST); } \\
  inline T    atomic_fetch_and(_Atomic T* p, T v) noexcept { \\
    return __c11_atomic_fetch_and(p, v, __ATOMIC_SEQ_CST); } \\
  inline T    atomic_fetch_and(volatile _Atomic T* p, T v) noexcept { \\
    return __c11_atomic_fetch_and(p, v, __ATOMIC_SEQ_CST); }

NBC_C11_ATOMIC_OPS(bool)
NBC_C11_ATOMIC_OPS(int)
NBC_C11_ATOMIC_OPS(unsigned int)
NBC_C11_ATOMIC_OPS(long)
NBC_C11_ATOMIC_OPS(unsigned long)
NBC_C11_ATOMIC_OPS(long long)
NBC_C11_ATOMIC_OPS(unsigned long long)

#undef NBC_C11_ATOMIC_OPS

#endif // __cplusplus
`;

const rubyCode = `
  ${GUARD}
  atomic_fix_path = File.join(File.dirname(__FILE__), 'AtomicFix.h')
  installer.pods_project.build_configurations.each do |proj_bc|
    existing = proj_bc.build_settings['OTHER_CPLUSPLUSFLAGS'] || '$(inherited)'
    unless existing.include?('AtomicFix.h')
      proj_bc.build_settings['OTHER_CPLUSPLUSFLAGS'] = existing + ' -include "' + atomic_fix_path + '"'
    end
  end
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |tgt_bc|
      existing = tgt_bc.build_settings['OTHER_CPLUSPLUSFLAGS'] || '$(inherited)'
      unless existing.include?('AtomicFix.h')
        tgt_bc.build_settings['OTHER_CPLUSPLUSFLAGS'] = existing + ' -include "' + atomic_fix_path + '"'
      end
    end
  end
`;

// Depth-count Ruby blocks to find the '\n' position just before
// the closing 'end' of 'post_install do |installer|'.
function findPostInstallInsertPos(content) {
  const marker = 'post_install do |installer|';
  const markerPos = content.indexOf(marker);
  if (markerPos === -1) return -1;

  let scanFrom = content.indexOf('\n', markerPos) + 1;
  let depth = 1;

  while (scanFrom < content.length) {
    const lineEnd = content.indexOf('\n', scanFrom);
    const lineEndPos = lineEnd === -1 ? content.length : lineEnd;
    const line = content.slice(scanFrom, lineEndPos);

    const doCount = (line.match(/\bdo\b/g) || []).length;
    const ctrlOpen = /^\s*(if|unless|while|until|for|begin|def|class|module)\b/.test(line) ? 1 : 0;
    const endCount = (line.match(/\bend\b/g) || []).length;

    depth += doCount + ctrlOpen - endCount;

    if (depth <= 0) {
      return scanFrom - 1; // '\n' before the closing 'end' line
    }

    if (lineEnd === -1) break;
    scanFrom = lineEnd + 1;
  }

  return -1;
}

const withCxxStandard = (config) => {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const iosDir = config.modRequest.platformProjectRoot;

      // Create AtomicFix.h in ios/ — referenced by the Podfile hook at build time
      fs.writeFileSync(path.join(iosDir, 'AtomicFix.h'), ATOMIC_FIX_CONTENT);

      const podfilePath = path.join(iosDir, 'Podfile');
      if (!fs.existsSync(podfilePath)) return config;

      let content = fs.readFileSync(podfilePath, 'utf8');
      if (content.includes(GUARD)) return config;

      if (content.includes('post_install do |installer|')) {
        const insertPos = findPostInstallInsertPos(content);
        if (insertPos !== -1) {
          // Insert at end of block so we run after react_native_post_install
          content = content.slice(0, insertPos) + '\n' + rubyCode + content.slice(insertPos);
        } else {
          content = content.replace(
            'post_install do |installer|',
            `post_install do |installer|\n${rubyCode}`
          );
        }
      } else {
        content += `\npost_install do |installer|\n${rubyCode}\nend\n`;
      }

      fs.writeFileSync(podfilePath, content);
      return config;
    },
  ]);
};

module.exports = withCxxStandard;
