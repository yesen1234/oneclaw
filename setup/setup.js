// ============================================
// OneClaw Setup — 三步向导交互逻辑
// ============================================

(function () {
  "use strict";

  // ---- Provider 预设配置（仅保留 Custom） ----
  const PROVIDERS = {
    custom: {
      placeholder: "",
      models: [],
    },
  };

  // ---- 国际化文案 ----
  const I18N = {
    en: {
      title: "OpenClaw Setup",
      "welcome.title": "Welcome to OpenClaw",
      "welcome.subtitle": "Your intelligent desktop assistant powered by large language models. Let's get you set up in just a few steps.",
      "welcome.security.title": "Your keys stay local",
      "welcome.security.desc": "API keys are stored securely on your machine and never sent to any third-party server.",
      "welcome.next": "Next",
      "config.title": "Configure Provider",
      "config.subtitle": "Enter your API key.",
      "config.platform": "Platform",
      "config.baseUrl": "Base URL",
      "config.apiKey": "API Key",
      "config.getKey": "Get API Key →",
      "config.model": "Model",
      "config.modelId": "Model ID",
      "config.apiType": "API Type",
      "config.custom": "Custom",
      "config.back": "Back",
      "config.verify": "Verify & Continue",
      "config.imageSupport": "Model supports image input",
      "done.title": "All Set!",
      "done.subtitle": "OpenClaw is ready. Here's what you can do:",
      "done.feature1": "Chat with state-of-the-art language models",
      "done.feature2": "Generate and execute code in real time",
      "done.feature3": "Manage multiple conversations and contexts",
      "done.feature4": "Switch providers or models anytime in Settings",
      "done.launchAtLogin": "Launch at login",
      "done.installCli": "Add openclaw command to terminal PATH",
      "done.start": "Start OpenClaw",
      "done.starting": "Starting Gateway…",
      "done.startFailed": "Gateway failed to start. Please click Start OpenClaw to retry.",
      "error.noKey": "Please enter your API key.",
      "error.noBaseUrl": "Please enter the Base URL.",
      "error.noModelId": "Please enter the Model ID.",
      "error.verifyFailed": "Verification failed. Please check your API key.",
      "error.connection": "Connection error: ",
    },
    zh: {
      title: "OpenClaw 安装引导",
      "welcome.title": "欢迎使用 OpenClaw",
      "welcome.subtitle": "基于大语言模型的智能桌面助手，只需几步即可完成配置。",
      "welcome.security.title": "密钥安全存储",
      "welcome.security.desc": "API 密钥安全存储在本地设备，绝不会发送到任何第三方服务器。",
      "welcome.next": "下一步",
      "config.title": "配置服务商",
      "config.subtitle": "填写API 密钥。",
      "config.platform": "平台",
      "config.baseUrl": "接口地址",
      "config.apiKey": "API 密钥",
      "config.getKey": "获取密钥 →",
      "config.model": "模型",
      "config.modelId": "模型 ID",
      "config.apiType": "接口类型",
      "config.custom": "自定义",
      "config.back": "返回",
      "config.verify": "验证并继续",
      "config.imageSupport": "模型支持图片输入",
      "done.title": "配置完成！",
      "done.subtitle": "安装 已就绪，你可以：",
      "done.feature1": "与最先进的大语言模型对话",
      "done.feature2": "实时生成并执行代码",
      "done.feature3": "管理多个对话和上下文",
      "done.feature4": "随时在设置中切换模型秘钥",
      "done.launchAtLogin": "开机启动",
      "done.installCli": "将 openclaw 命令添加到终端 PATH",
      "done.start": "启动 OpenClaw",
      "done.starting": "正在启动 Gateway…",
      "done.startFailed": 'Gateway 启动失败，请点击"启动 OpenClaw"重试。',
      "error.noKey": "请输入 API 密钥。",
      "error.noBaseUrl": "请输入接口地址。",
      "error.noModelId": "请输入模型 ID。",
      "error.verifyFailed": "验证失败，请检查 API 密钥。",
      "error.connection": "连接错误：",
    },
  };

  // ---- DOM 引用 ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    progressFill: $("#progressFill"),
    steps: $$(".step"),
    // Step 1
    btnToStep2: $("#btnToStep2"),
    // Step 2
    providerTabs: $("#providerTabs"),
    platformLink: $("#platformLink"),
    subPlatformGroup: $("#subPlatformGroup"),
    baseURLGroup: $("#baseURLGroup"),
    apiKeyInput: $("#apiKey"),
    btnToggleKey: $("#btnToggleKey"),
    modelSelectGroup: $("#modelSelectGroup"),
    modelSelect: $("#modelSelect"),
    modelInputGroup: $("#modelInputGroup"),
    modelInput: $("#modelInput"),
    apiTypeGroup: $("#apiTypeGroup"),
    imageSupportGroup: $("#imageSupportGroup"),
    imageSupport: $("#imageSupport"),
    errorMsg: $("#errorMsg"),
    btnBackToStep1: $("#btnBackToStep1"),
    btnVerify: $("#btnVerify"),
    btnVerifyText: $("#btnVerify .btn-text"),
    btnVerifySpinner: $("#btnVerify .btn-spinner"),
    // Step 3 — 完成
    installCliCheck: $("#installCliCheck"),
    btnStart: $("#btnStart"),
    btnStartText: $("#btnStart .btn-text"),
    btnStartSpinner: $("#btnStartSpinner"),
    doneStatus: $("#doneStatus"),
    launchAtLoginRow: $("#launchAtLoginRow"),
    launchAtLoginEnabled: $("#launchAtLoginEnabled"),
  };

  // ---- 状态 ----
  let currentStep = 1;
  let currentProvider = "custom";
  let verifying = false;
  let starting = false;
  let currentLang = "en";
  let launchAtLoginSupported = false;

  // ---- 语言检测（从 URL ?lang= 参数读取） ----
  function detectLang() {
    const params = new URLSearchParams(window.location.search);
    const lang = params.get("lang");
    currentLang = lang && I18N[lang] ? lang : "en";
  }

  // 翻译取值
  function t(key) {
    return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
  }

  // 遍历 data-i18n 属性，替换文本
  function applyI18n() {
    document.title = t("title");
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
  }

  // ---- 步骤切换 ----
  function goToStep(step) {
    currentStep = step;
    els.progressFill.style.width = `${Math.round(step * 100 / 3)}%`;

    els.steps.forEach((el, i) => {
      el.classList.toggle("active", i + 1 === step);
    });
  }

  // ---- Provider 切换（仅 Custom） ----
  function switchProvider(provider) {
    currentProvider = provider;
    const config = PROVIDERS[provider];

    $$(".provider-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.provider === provider);
    });

    els.apiKeyInput.placeholder = config.placeholder;
    els.apiKeyInput.value = "";
    hideError();
    updatePlatformLink();

    // 仅 Custom：显示 Base URL、Model ID、API Type、图像支持
    toggleEl(els.subPlatformGroup, false);
    toggleEl(els.baseURLGroup, true);
    toggleEl(els.modelInputGroup, true);
    toggleEl(els.apiTypeGroup, true);
    toggleEl(els.imageSupportGroup, true);
    toggleEl(els.modelSelectGroup, false);
  }

  function updatePlatformLink() {
    var url = PROVIDERS[currentProvider].platformUrl || "";
    if (url) {
      els.platformLink.textContent = t("config.getKey");
      els.platformLink.dataset.url = url;
      els.platformLink.classList.remove("hidden");
    } else {
      els.platformLink.classList.add("hidden");
    }
  }

  function updateModels() {
    populateModels(PROVIDERS[currentProvider].models || []);
  }

  // 填充模型下拉选项
  function populateModels(models) {
    els.modelSelect.innerHTML = "";
    models.forEach((m) => {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = m;
      els.modelSelect.appendChild(opt);
    });
  }

  // ---- 密码可见性切换 ----
  function toggleKeyVisibility() {
    const input = els.apiKeyInput;
    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";

    const eyeOn = els.btnToggleKey.querySelector(".icon-eye");
    const eyeOff = els.btnToggleKey.querySelector(".icon-eye-off");
    eyeOn.classList.toggle("hidden", !isPassword);
    eyeOff.classList.toggle("hidden", isPassword);
  }

  // ---- 验证并保存配置（Step 2） ----
  async function handleVerify() {
    if (verifying) return;

    const apiKey = els.apiKeyInput.value.trim();
    if (!apiKey) {
      showError(t("error.noKey"));
      return;
    }

    const params = buildParams(apiKey);
    if (!params) return;

    setVerifying(true);
    hideError();

    try {
      const result = await window.oneclaw.verifyKey(params);

      if (!result.success) {
        showError(result.message || t("error.verifyFailed"));
        setVerifying(false);
        return;
      }

      await window.oneclaw.saveConfig(buildSavePayload(params));
      setVerifying(false);
      goToStep(3);
    } catch (err) {
      showError(t("error.connection") + (err.message || "Unknown error"));
      setVerifying(false);
    }
  }

  // 根据当前表单状态构建验证参数
  function buildParams(apiKey) {
    const params = {
      provider: currentProvider,
      apiKey,
    };

    const baseURL = ($("#baseURL").value || "").trim();
    const modelID = (els.modelInput.value || "").trim();
    if (!baseURL) {
      showError(t("error.noBaseUrl"));
      return null;
    }
    if (!modelID) {
      showError(t("error.noModelId"));
      return null;
    }
    params.baseURL = baseURL;
    params.modelID = modelID;
    params.apiType = document.querySelector('input[name="apiType"]:checked').value;
    params.supportImage = els.imageSupport.checked;

    return params;
  }

  // 构建保存配置的 payload
  function buildSavePayload(params) {
    return {
      provider: params.provider,
      apiKey: params.apiKey,
      modelID: params.modelID,
      baseURL: params.baseURL || "",
      api: params.apiType || "",
      subPlatform: params.subPlatform || "",
      supportImage: params.supportImage ?? true,
    };
  }

  // ---- 完成 Setup ----
  async function handleComplete() {
    if (starting) return;
    setStarting(true);
    setDoneStatus("");

    try {
      const payload = {
        installCli: els.installCliCheck.checked,
      };
      if (launchAtLoginSupported) {
        payload.launchAtLogin = !!els.launchAtLoginEnabled.checked;
      }
      const result = await window.oneclaw.completeSetup(payload);
      if (!result || !result.success) {
        setStarting(false);
        setDoneStatus(result?.message || t("done.startFailed"), true);
      }
    } catch (err) {
      setStarting(false);
      setDoneStatus((err && err.message) || t("done.startFailed"), true);
    }
  }

  // 读取系统层开机启动状态并回填 Step 3 开关。
  async function loadLaunchAtLoginState() {
    if (!window.oneclaw?.setupGetLaunchAtLogin) {
      return;
    }
    try {
      const result = await window.oneclaw.setupGetLaunchAtLogin();
      if (!result?.success || !result.data) {
        return;
      }
      launchAtLoginSupported = result.data.supported === true;
      toggleEl(els.launchAtLoginRow, launchAtLoginSupported);
      if (launchAtLoginSupported) {
        // 默认不勾选（由用户主动选择是否开机启动）
        els.launchAtLoginEnabled.checked = false;
      }
    } catch {
      // 获取失败时不阻断 Setup 流程，保持开关隐藏。
      launchAtLoginSupported = false;
    }
  }

  // ---- UI 辅助 ----
  function toggleEl(el, show) {
    el.classList.toggle("hidden", !show);
  }

  function showError(msg) {
    els.errorMsg.textContent = msg;
    els.errorMsg.classList.remove("hidden");
  }

  function hideError() {
    els.errorMsg.classList.add("hidden");
    els.errorMsg.textContent = "";
  }

  function setVerifying(loading) {
    verifying = loading;
    els.btnVerify.disabled = loading;
    els.btnVerifyText.classList.toggle("hidden", loading);
    els.btnVerifySpinner.classList.toggle("hidden", !loading);
  }

  // Step 4 启动状态（等待 Gateway 就绪）
  function setStarting(loading) {
    starting = loading;
    els.btnStart.disabled = loading;
    if (loading) {
      els.btnStartText.textContent = t("done.starting");
      els.btnStartSpinner.classList.remove("hidden");
    } else {
      els.btnStartText.textContent = t("done.start");
      els.btnStartSpinner.classList.add("hidden");
    }
  }

  // Step 4 状态提示
  function setDoneStatus(msg, isError) {
    if (!msg) {
      els.doneStatus.classList.add("hidden");
      els.doneStatus.classList.remove("error");
      els.doneStatus.textContent = "";
      return;
    }
    els.doneStatus.textContent = msg;
    els.doneStatus.classList.remove("hidden");
    els.doneStatus.classList.toggle("error", !!isError);
  }

  // ---- 事件绑定 ----
  function bindEvents() {
    els.btnToStep2.addEventListener("click", () => goToStep(2));
    els.btnBackToStep1.addEventListener("click", () => goToStep(1));

    // Provider Tab 切换
    els.providerTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".provider-tab");
      if (tab) switchProvider(tab.dataset.provider);
    });

    // 平台链接点击 → 用系统浏览器打开
    els.platformLink.addEventListener("click", (e) => {
      e.preventDefault();
      const url = els.platformLink.dataset.url;
      if (url && window.oneclaw?.openExternal) {
        window.oneclaw.openExternal(url);
      }
    });

    els.btnToggleKey.addEventListener("click", toggleKeyVisibility);
    els.btnVerify.addEventListener("click", handleVerify);

    els.apiKeyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleVerify();
    });

    // Step 3 — 完成
    els.btnStart.addEventListener("click", handleComplete);
  }

  // ---- 初始化 ----
  function init() {
    detectLang();
    applyI18n();
    bindEvents();
    switchProvider("custom");
    goToStep(1);
    loadLaunchAtLoginState();
  }

  init();
})();
