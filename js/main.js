// js/main.js

(function () {
  const {
    API_ENDPOINTS,
  } = window.DeSilhouetteConfig || {};

  // Cek: kalau elemen utama workspace tidak ada, jangan inisialisasi
  function isWorkspacePage() {
    return document.getElementById("workspace") !== null;
  }

  const state = {
    mode: "originalQuality",
    file: null,
    originalImageUrl: null,
    resultImageUrl: null,
    isProcessing: false,
  };

  function setYear() {
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  function initWorkspace() {
    if (!isWorkspacePage()) return;

    const modeCards = document.querySelectorAll(".ds-mode-card");
    const previewModeLabel = document.getElementById("preview-mode-label");

    const uploadCard = document.getElementById("upload-card");
    const uploadInner = document.getElementById("upload-inner");
    const uploadLoading = document.getElementById("upload-loading");
    const fileInput = document.getElementById("file-input");

    const previewPlaceholder = document.getElementById("preview-placeholder");
    const previewImages = document.getElementById("preview-images");
    const previewOriginal = document.getElementById("preview-original");
    const previewResult = document.getElementById("preview-result");

    const resetBtn = document.getElementById("reset-btn");
    const downloadBtn = document.getElementById("download-btn");
    const scrollToWorkspaceBtn = document.getElementById("scroll-to-workspace");

    function setMode(mode) {
      state.mode = mode;
      modeCards.forEach((card) => {
        card.classList.toggle(
          "ds-mode-card--active",
          card.dataset.mode === mode
        );
      });
      previewModeLabel.textContent =
        mode === "precision" ? "Precision Mode" : "Original Quality Mode";
    }

    function setProcessing(isProcessing) {
      state.isProcessing = isProcessing;

      if (isProcessing) {
        uploadInner.classList.add("ds-upload-inner--hidden");
        uploadLoading.classList.add("ds-upload-loading--visible");
      } else {
        uploadInner.classList.remove("ds-upload-inner--hidden");
        uploadLoading.classList.remove("ds-upload-loading--visible");
      }
    }

    function resetState() {
      state.file = null;

      if (state.originalImageUrl) {
        URL.revokeObjectURL(state.originalImageUrl);
        state.originalImageUrl = null;
      }
      if (state.resultImageUrl) {
        URL.revokeObjectURL(state.resultImageUrl);
        state.resultImageUrl = null;
      }

      previewOriginal.src = "";
      previewResult.src = "";

      previewPlaceholder.style.display = "flex";
      previewImages.style.display = "none";

      resetBtn.disabled = true;
      downloadBtn.disabled = true;
    }

    function showError(message) {
      alert(message || "Something went wrong. Please try again.");
    }

    async function processImage(file) {
      if (!file) {
        showError("Please select an image first.");
        return;
      }

      const endpoint =
        state.mode === "precision"
          ? API_ENDPOINTS.precision
          : API_ENDPOINTS.originalQuality;

      if (!endpoint) {
        showError("API endpoint is not configured.");
        return;
      }

      setProcessing(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(endpoint, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const blob = await response.blob();

        if (state.originalImageUrl) {
          URL.revokeObjectURL(state.originalImageUrl);
        }
        if (state.resultImageUrl) {
          URL.revokeObjectURL(state.resultImageUrl);
        }

        state.originalImageUrl = URL.createObjectURL(file);
        state.resultImageUrl = URL.createObjectURL(blob);

        previewOriginal.src = state.originalImageUrl;
        previewResult.src = state.resultImageUrl;

        previewPlaceholder.style.display = "none";
        previewImages.style.display = "flex";

        resetBtn.disabled = false;
        downloadBtn.disabled = false;
      } catch (err) {
        console.error(err);
        showError("Failed to process image. Please try again.");
      } finally {
        setProcessing(false);
      }
    }

    function handleModeClick(e) {
      const mode = e.currentTarget.dataset.mode;
      setMode(mode);
    }

    function handleUploadClick() {
      if (state.isProcessing) return;
      fileInput.click();
    }

    function handleFileChange(e) {
      const file = e.target.files[0];
      if (!file) return;
      state.file = file;
      processImage(file);
    }

    function handleDragOver(e) {
      e.preventDefault();
      e.stopPropagation();
      uploadCard.classList.add("ds-upload-card--dragover");
    }

    function handleDragLeave(e) {
      e.preventDefault();
      e.stopPropagation();
      uploadCard.classList.remove("ds-upload-card--dragover");
    }

    function handleDrop(e) {
      e.preventDefault();
      e.stopPropagation();
      uploadCard.classList.remove("ds-upload-card--dragover");

      if (state.isProcessing) return;

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        showError("Please upload an image file.");
        return;
      }

      state.file = file;
      fileInput.value = "";
      processImage(file);
    }

    function handleReset() {
      if (state.isProcessing) return;
      resetState();
    }

    function handleDownload() {
      if (!state.resultImageUrl) return;

      const link = document.createElement("a");
      link.href = state.resultImageUrl;
      link.download =
        state.mode === "precision"
          ? "desilhouette-precision.png"
          : "desilhouette-original-quality.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    function scrollToWorkspace() {
      const workspace = document.getElementById("workspace");
      if (!workspace) return;
      workspace.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    // Init workspace
    setMode("originalQuality");
    resetState();
    setProcessing(false);

    modeCards.forEach((card) => {
      card.addEventListener("click", handleModeClick);
    });

    uploadCard.addEventListener("click", handleUploadClick);
    uploadCard.addEventListener("dragover", handleDragOver);
    uploadCard.addEventListener("dragleave", handleDragLeave);
    uploadCard.addEventListener("drop", handleDrop);

    fileInput.addEventListener("change", handleFileChange);

    resetBtn.addEventListener("click", handleReset);
    downloadBtn.addEventListener("click", handleDownload);
    if (scrollToWorkspaceBtn) {
      scrollToWorkspaceBtn.addEventListener("click", scrollToWorkspace);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    initWorkspace();
  });
})();
