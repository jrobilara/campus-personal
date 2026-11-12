# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: sim-funcion.spec.ts >> descenso >> el gráfico tiene los rótulos en español y estados de x₀, el punto actual, los mínimos y los ejes
- Location: e2e/sim-funcion.spec.ts:76:3

# Error details

```
Error: locator.scrollIntoViewIfNeeded: Element is not attached to the DOM
Call log:
  - attempting scroll into view action
    - waiting for "http://127.0.0.1:4405/campus-personal/ejemplo/simuladores/" navigation to finish...
    - navigated to "http://127.0.0.1:4405/campus-personal/ejemplo/simuladores/"
    - waiting for element to be stable

```

```
Error: browserContext.close: Test ended.
Browser logs:

<launching> /home/juan/.cache/ms-playwright/chromium_headless_shell-1254/chrome-headless-shell-linux64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,DestroyProfileOnBrowserClose,HttpsUpgrades,HttpsFirstBalancedModeAutoEnable,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,AvoidCorsURLLoaderRestartOnRedirect,TcpPortRandomizationWin,OptimizationHints,NetworkTimeServiceQuerying,AimEnabled,PreconnectToSearch,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface,SkipListAccountsWithoutGaiaCookies --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --disable-updater-scheduler --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --enable-unsafe-swiftshader --edge-skip-compat-layer-relaunch --disable-stack-profiler --disable-infobars --disable-sync --do-not-de-elevate --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/tmp/playwright_chromiumdev_profile-aC5tM9 --remote-debugging-pipe --no-startup-window
<launched> pid=190262
[pid=190262][err] [1111/224859.880478:WARNING:sandbox/policy/linux/sandbox_linux.cc:405] InitializeSandbox() called with multiple threads in process gpu-process.
[pid=190262][err] [1111/224902.574153:INFO:CONSOLE:1680] "[vite] connecting...", source: http://127.0.0.1:4405/@vite/client (1680)
[pid=190262][err] [1111/224903.886004:INFO:CONSOLE:1789] "[vite] connected.", source: http://127.0.0.1:4405/@vite/client (1789)
[pid=190262][err] [1111/224910.526188:INFO:CONSOLE:15859] "%cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold", source: http://127.0.0.1:4405/@fs/tmp/claude-1000/-home-juan/bbcad05a-c209-4ace-bda0-6ca88a5a3f55/scratchpad/vite-4405/deps/client-BGZMjJVb.js?v=ff26a5d8 (15859)
[pid=190262] <gracefully close start>
[pid=190262][err] [1111/224923.703396:ERROR:content/common/zygote/zygote_communication_linux.cc:318] Failed to send GetTerminationStatus message to zygote: Tubería rota (32)
[pid=190262][err] [1111/224923.733984:ERROR:content/browser/network_service_instance_impl.cc:655] Network service crashed or was terminated, restarting service.
```