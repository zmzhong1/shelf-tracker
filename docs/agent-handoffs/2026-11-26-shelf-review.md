Status: in progress

# Shelf tracker and scanner review

Date: 2026-11-26. Repo root is Kristina Project (shelf-tracker is its subdirectory). Existing clean branch seoul-glass-followups at 86159c5 already has https://github.com/zmzhong1/shelf-tracker/pull/13 into main. Own worktree branch codex/shelf-review is based on that exact UI/scanner edition; no duplicate replacement PR or mutation of the existing branch. Follow-up PR #14 stacks on #13 and must be retargeted to main after #13 merges.

## Scope and acceptance

Ming requested scanner/tracker review, confirmed defect fixes, tests and model retirement checks. Preserve leading-zero codes as text, 16-column TSV contract, Traditional Chinese data, earliest printed/opened+PAO/mfg+36 expiry rule, keyless artifact-only scanner, no localStorage in the keyless scanner (existing tracker preferences are preserved). No live Sheets/API calls, email sends, clasp push/deploy, artifact publication or release. Do not read private .env*, .clasp config, credentials or key files. Tests use synthetic data, never actual inventory. Existing embedded catalog data remains unchanged.

Read shelf-tracker/CLAUDE.md. Its deployment/iPhone checklist cannot be completed under this review-only release boundary; those live checks remain not verified. No architecture redesign, paid API, model replacement, or new data schema.

## Model audit

Runtime scanner model: claude-sonnet-4-6 at shelf-tracker/scanner/shelf-scanner.html:261. Anthropic's official deprecations page checked 2026-11-26 lists it Active, not sooner than 2027-02-17 retirement. The previous claude-sonnet-4-20250514 retired 2026-06-15. No other runtime model ID found in source; old IDs remain in dated history/docs only. Source: https://platform.claude.com/docs/en/about-claude/model-deprecations . Availability inside the user's published Claude artifact was not exercised; API lifecycle documentation does not prove that live artifact works.

## Confirmed findings under regression

- P1 data integrity: backend bulkImport trims whole TSV lines, dropping a blank first column and shifting remaining values into wrong fields. Preserve empty columns and leading zeros.
- P2 expiry: mfg+36 months is only a fallback instead of participating in the required earliest-of-all rule. Invalid PAO can poison a valid date. Align backend, tracker and catalog with finite positive PAO validation.
- P2 scanner: Clear does not invalidate pending response; late results restore deleted rows. Missing/unrecognized confidence is shown as high. An array containing a null or non-object product can partially append rows before a later error. Use synthetic async/error tests, validate product entries before appending results, treat unknown confidence conservatively.
- P3 scanner field fidelity: numeric zero is lost by || defaults and raw CR can enter TSV. Preserve string forms and sanitize all TSV delimiters.

- P1 haul row identity: multiple asynchronous mutations used stale physical sheet row numbers after a deletion. Serialize same-page reads and writes, require a successful authoritative refresh, preserve visible rows with Retry after failure, and roll back failed optimistic checkbox state. Stable IDs for separate tabs/manual edits remain a design follow-up.
- P2 save recovery: scanner Save stayed disabled after failure or duplicate Cancel; only disable on actual submission and restore after failure.
- P3 scanner memory: Clear retained all object URLs; revoke each queued URL once when the photos and rows are cleared.

## Validation and review

Initial combined suite: **37/37 passed, 0 skipped, 94.175459 ms**, Node v24.14.0. Includes 9 backend + 9 scanner + 19 interface tests; synthetic data and stubbed Apps Script/network only. `npm run check` passed, parsed the Tracker script and generated ignored local preview from the existing snapshot (201 items, 6 wishlist); the preview was not published or viewed. Embedded Catalog inventory/wishlist declarations are byte-for-byte unchanged. `git diff --check` passed. Final synchronized rerun pending; later source review also covers the Firebase tracker as described below.

Regression-first logs remain ignored under `_work/review/`: backend initially 7 failed/2 passed; scanner 7 failed/2 passed; UI 17 failed/2 passed; URL cleanup extension 2 failed/7 passed. Earlier backend harness timezone expectations were corrected separately, not counted as production defects. Verbatim failure excerpts follow below (blank-only whitespace omitted).

Native Apps Script, real Sheet text formatting, Safari barcode capture, live scanner/API, published artifact, reduced-motion/dark-mode rendering and photocard downloads remain not verified. No CI discovered yet. Claude checkpoint pending; previous calls in this session hit the account five-hour limit, not an authentication failure.

Rollback: revert only the follow-up review PR. No sheet schema or real data migration. Leave PRs unmerged for Ming; no deletion of files/worktrees/branches.

shelf-backend-confirmed-red.log:
```text
ℹ tests 9
ℹ pass 2
ℹ fail 7
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected
  ... Skipped lines

    [
      [
  -     '',
        '霧面唇彩',
```

scanner-red.log:
```text
ℹ tests 9
ℹ pass 2
ℹ fail 7
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:

  1 !== 0

      at TestContext.<anonymous> (/Volumes/Extreme SSD/Tools/Kristina Project/.worktrees/codex-shelf-review/shelf-tracker/tests/scanner.test.cjs:70:10)
      at async Test.run (node:internal/test_runner/test:1125:7)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:358:3) {
    generatedMessage: true,
```

ui-red.log:
```text
ℹ tests 19
ℹ pass 2
ℹ fail 17
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  + actual - expected

  + '2027-01-01'
  - '2026-01-01'
        ^

      at assertExpiry (/Volumes/Extreme SSD/Tools/Kristina Project/.worktrees/codex-shelf-review/shelf-tracker/tests/ui.test.cjs:38:10)
```

scanner-clear-url-red.log:
```text
ℹ tests 9
ℹ pass 7
ℹ fail 2
  AssertionError [ERR_ASSERTION]: Expected values to be strictly deep-equal:
  + actual - expected

  + []
  - [
  -   'blob:synthetic-0',
  -   'blob:synthetic-1'
  - ]
```

## PR integration

The follow-up stacks on `seoul-glass-followups` because it patches the scanner/UI introduced in PR #13. Existing overlap: apps-script/index.html, scanner/shelf-scanner.html, package.json and docs/decisions.md. Merge #13 into main first, retarget this PR to main, refresh and test before merging it. Do not merge the follow-up into its temporary base branch. No CI workflows/checks are configured or reported for the existing PR.

## Current main integration and Firebase review

Required final synchronization revealed `origin/main` at 2ecd398 contains the owner-directed Firebase re-platform and later UI improvements. The original branch is an older Apps Script/scanner edition. Merged main into the review branch as 0c5865f, preserving both implementations. Resolved three conflicts by unioning ignore entries and decision history, and keeping both Firebase and clasp package dependencies. Updated the lockfile without installing packages or running lifecycle scripts; no previously locked dependency version changed or disappeared. PR #14's temporary comparison includes main commits absent from #13; after #13 merges, retarget #14 to main so that review shows only the outstanding changes.

The current Firebase `web/index.html` is also being reviewed and tested. It uses stable Firestore document IDs; legacy physical-sheet row semantics must not be copied into it. Existing Auth/allow-list rules and hosting remain unchanged, no live Firebase calls. Source/runtime checks cannot verify the deployed rules or logged-in application.

Actual Claude checkpoint attempt for 86159c5..d2ce8c8 returned exit 1 and no verdict:
```text
You've hit your 5-hour limit · resets 6:30pm (Europe/Brussels)
```
Claude review pending for the final combined patch. This is an account usage limit, not a sign-in failure. A Codex subagent independently reviewed the original 37-test patch and found no regression; that is not a Claude GO.

Current Firebase findings: P1 whole-line TSV trimming in both API and Import UI; P2 the same earliest-expiry and scanner save retry/duplicate-Cancel defects; P2 camera/lookup/decode completions can mutate UI or start a stream after cancellation; P2 haul reads swallow errors and discard last-known rows, and failed optimistic check changes remain visible. Synthetic regressions are in progress; stable string document IDs are preserved.

P3 verification wording: `scripts/verify-locked.mjs:22` claimed the allow-list was enforced after testing only an unauthenticated read. Corrected that log to state its actual evidence; script syntax passed, but the script was not executed against Firebase. Rules check an allowed email without checking `email_verified` or Google provider. Exploitability depends on enabled Auth providers and is unverified; rules and provider configuration were not changed. Future live verification must test signed-out, signed-in disallowed and allowed users, plus reads and writes.

Camera lifecycle references: https://scanapp.org/html5-qrcode-docs/docs/apis/classes/Html5Qrcode documents asynchronous start/stop and clear requiring a stopped webcam. Synthetic cancellation/restart coverage checks callback ownership; actual Safari hardware behavior remains not verified.

Firebase regressions: baseline 18 failed / 1 passed; added restart-cleanup regression failed before its guard. Final agent run web 20/20; web + legacy UI 39/39. Root synchronized full run follows. Verbatim baseline summary:
```text
web-red.log
ℹ tests 19
ℹ pass 1
ℹ fail 18
web-camera-restart-red.log
ℹ tests 1
ℹ pass 0
ℹ fail 1
```

Final camera follow-up serializes replacement construction behind previous start settlement and stop/clear completion. Exact upstream 2.3.8 source confirms stop itself mutates shared DOM: https://raw.githubusercontent.com/mebjas/html5-qrcode/v2.3.8/src/html5-qrcode.ts . Tests reproduce that internal mutation and rejected-start recovery. Web suite now 22/22 passed (118.530291 ms); prior serialization failure output is retained at `_work/review/web-stop-serialization-red.log`.

During synchronization `git pull --rebase` attempted to replay the unpublished main merge; aborted it before edits, restored d5d3c24 clean, with no source loss or shared history rewrite. Publishing the coherent integration checkpoint before the final fetch/pull/merge avoids replaying that merge.
