const micStatus = document.getElementById("mic-status");
const btnGrabar = document.getElementById("btn-grabar");
const btnDetener = document.getElementById("btn-detener");
const audioPreview = document.getElementById("audio-preview");
const btnEscuchar = document.getElementById("btn-escuchar");
const btnBorrar = document.getElementById("btn-borrar");
const btnEnviar = document.getElementById("btn-enviar");
const form = document.querySelector("form");

let mediaRecorder;
let audioChunks = [];
let blob = null;
let isRecording = false;
let isSending = false;

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
  btnGrabar.toggleAttribute("disabled", isRecording);
  btnEnviar.toggleAttribute("disabled", blob === null || isSending);
};

async function startRecording() {
  isRecording = true;
  //  permiso al micrófono
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // crear grabador
  mediaRecorder = new MediaRecorder(stream);

  // cada vez que llegan datos se guardan en el array
  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  // cuando para, se arma el archivo
  mediaRecorder.onstop = () => {
    blob = new Blob(audioChunks, { type: "audio/webm" });
    const audioUrl = URL.createObjectURL(blob);
    audioPreview.src = audioUrl;
    toggleButtons();
  };

  mediaRecorder.start();
}

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
  micStatus.textContent = "esperando grabación";
  toggleButtons();
};

form.onsubmit = async (e) => {
  e.preventDefault();

  const formData = new FormData();

  formData.append("file", blob, "grabacion.webm");
  isSending = true;
  toggleButtons();

  const response = await fetch("http://127.0.0.1:8000/uploadfile/", {
    method: "POST",
    body: formData,
  });
  const data = await response.json();

  isSending = false;
  toggleButtons();
  renderResults(data);
};

toggleButtons();
