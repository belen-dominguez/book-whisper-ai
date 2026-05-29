const API_URL =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:8000"
    : "https://book-whisper-api.railway.app";

const micStatus = document.getElementById("mic-status");
const btnGrabar = document.getElementById("btn-grabar");
const btnDetener = document.getElementById("btn-detener");
const audioPreview = document.getElementById("audio-preview");
const btnEscuchar = document.getElementById("btn-escuchar");
const btnBorrar = document.getElementById("btn-borrar");
const btnEnviar = document.getElementById("btn-enviar");
const form = document.querySelector("form");
const canvas = document.getElementById("visualizer");
const canvasCtx = canvas.getContext("2d");
const loadingSection = document.querySelector(".loading-section");
const resultsSection = document.querySelector(".results-section");
const loadingMessage = loadingSection.querySelector(".loading-message");
const loader = loadingSection.querySelector(".loader");
const btnSave = document.getElementById("btn-guardar");

let mediaRecorder;
let audioChunks = [];
let blob = null;
let isRecording = false;
let isSending = false;
let animationId = null;
let analyser = null;
let audioContext = null;
let audioYaAnalizado = false;
let datosGuardados = false;
let apiResponseData = null;

const renderResults = (data) => {
  const {
    frase_transcripta,
    frases_celebres,
    pregunta_reflexion,
    recomendaciones,
    tema,
    tono,
  } = data;
  const resultsContainer = document.getElementById("results");
  const citaElem = resultsContainer.querySelector(".cita");
  const temaElem = resultsContainer.querySelector(".tema .tema-content");
  const tonoElem = resultsContainer.querySelector(".tono .tono-content");
  const preguntaElem = resultsContainer.querySelector(".resumen-content");
  const recomendacionesContainer = resultsContainer.querySelector(
    ".recomendacion .recomendacion-content",
  );
  const frasesContainer = resultsContainer.querySelector(
    ".frases .frases-content",
  );

  citaElem && (citaElem.textContent = frase_transcripta);
  temaElem && (temaElem.textContent = tema);
  tonoElem && (tonoElem.textContent = tono);
  preguntaElem && (preguntaElem.textContent = pregunta_reflexion);

  recomendacionesContainer &&
    recomendaciones &&
    (recomendacionesContainer.innerHTML = `
    ${recomendaciones
      .map(
        (recomendacion) => `<div class="recomendacion-item">
       <i class="fa-solid fa-book"></i>
        <div class="detail">
            <p class="recomendacion-title">${recomendacion.titulo}</p>
            <p class="recomendacion-author">${recomendacion.autor}</p>
        </div>
    </div>`,
      )
      .join("")}
  `);

  frasesContainer &&
    frases_celebres &&
    (frasesContainer.innerHTML = `
    ${frases_celebres
      .map(
        (frase) => `<div class="frases-item">
       <i class="fa-solid fa-quote-left"></i>
        <div class="detail">
            <p class="frases-title">${frase.frase}</p>
            <p class="frases-author">${frase.autor}</p>
        </div>
    </div>`,
      )
      .join("")}
  `);
};
const toggleButtons = () => {
  btnDetener.toggleAttribute("disabled", !isRecording);
  btnGrabar.toggleAttribute(
    "disabled",
    isRecording || isSending || blob !== null,
  );
  btnEnviar.toggleAttribute(
    "disabled",
    blob === null || isSending || audioYaAnalizado,
  );
  btnBorrar.toggleAttribute("disabled", blob === null || isSending);
  btnEscuchar.toggleAttribute("disabled", blob === null || isSending);
  btnSave.toggleAttribute("disabled", datosGuardados);
};

function drawVisualizer() {
  if (!analyser) return;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  const draw = () => {
    animationId = requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barCount = 40;
    const barWidth = canvas.width / barCount;
    const step = Math.floor(bufferLength / barCount);

    for (let i = 0; i < barCount; i++) {
      const value = dataArray[i * step];
      const barHeight = (value / 255) * canvas.height;
      const x = i * barWidth;
      const y = canvas.height - barHeight;

      const hue = 210 + (value / 255) * 40;
      canvasCtx.fillStyle = `hsla(${hue}, 80%, 65%, ${0.6 + (value / 255) * 0.4})`;
      canvasCtx.beginPath();
      canvasCtx.roundRect(x + 1, y, barWidth - 2, barHeight, 3);
      canvasCtx.fill();
    }
  };

  draw();
}

function stopVisualizer() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
}

async function startRecording() {
  isRecording = true;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Setup audio visualizer
  audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  analyser = audioContext.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  drawVisualizer();

  // Setup recorder
  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  mediaRecorder.onstop = () => {
    blob = new Blob(audioChunks, { type: "audio/webm" });
    const audioUrl = URL.createObjectURL(blob);
    audioPreview.src = audioUrl;
    stopVisualizer();
    if (audioContext) {
      audioContext.close();
      audioContext = null;
    }
    toggleButtons();
  };

  mediaRecorder.start();
}

const toggleLoading = (isLoading) => {
  loadingMessage.textContent = isLoading
    ? "Buscando tus próximas lecturas... 📚"
    : "";
  loader.classList.toggle("hidden", !isLoading);
  resultsSection.classList.toggle("active", !isLoading);
  loadingSection.classList.toggle("inactive", !isLoading);
};

audioPreview.onplay = () => {
  btnEscuchar.disabled = true;
};
audioPreview.onended = () => {
  btnEscuchar.disabled = false;
};

btnGrabar.onclick = () => {
  startRecording();
  micStatus.textContent = "grabando...";
  toggleButtons();
};

btnDetener.onclick = () => {
  if (isRecording) {
    isRecording = false;
    mediaRecorder && mediaRecorder.stop();
    micStatus.textContent = "grabación detenida";
  }
};

btnEscuchar.onclick = () => {
  audioPreview.play();
};

btnBorrar.onclick = () => {
  audioPreview.src = "";
  blob = null;
  audioChunks = [];
  audioYaAnalizado = false;
  micStatus.textContent = "esperando grabación";
  toggleButtons();
};

form.onsubmit = async (e) => {
  if (audioYaAnalizado) return;
  e.preventDefault();

  const formData = new FormData();

  formData.append("file", blob, "grabacion.webm");
  isSending = true;
  toggleButtons();
  toggleLoading(true);

  const response = await fetch(`${API_URL}/uploadfile/`, {
    method: "POST",
    body: formData,
  });
  apiResponseData = await response.json();

  isSending = false;
  audioYaAnalizado = true;
  datosGuardados = false;
  toggleButtons();
  toggleLoading(false);
  renderResults(apiResponseData);
};

btnSave.onclick = async () => {
  if (datosGuardados) return;
  await guardarResultado();
};

toggleButtons();

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);

async function guardarResultado() {
  if (!apiResponseData) return;

  const { error } = await supabaseClient.from("analisis").insert({
    frase: apiResponseData.frase_transcripta,
    tema: apiResponseData.tema,
    tono: apiResponseData.tono,
    recomendaciones: apiResponseData.recomendaciones,
    frases_celebres: apiResponseData.frases_celebres,
    pregunta_reflexion: apiResponseData.pregunta_reflexion,
  });

  if (error) {
    console.error("Error guardando:", error);
    datosGuardados = false;
  } else {
    console.log("Guardado!");
    datosGuardados = true;
  }

  btnSave.toggleAttribute("disabled", datosGuardados);
}
