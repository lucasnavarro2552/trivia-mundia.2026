// --- CONFIGURACIÓN DE SUPABASE ---
// Usamos 'supabaseClient' para evitar el conflicto con la librería global
const SUPABASE_URL = "https://zekujsyserfsgmvwvksp.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpla3Vqc3lzZXJmc2dtdnd2a3NwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTkwMjksImV4cCI6MjA5Nzk5NTAyOX0.gYVV_bcca8e7xhiE2LxESm-45pMMj_KUh2YRB9oxkZk";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Base de datos de preguntas sobre el Mundial 2026
const questionsPool = [
    {
        question: "¿Cuántas selecciones nacionales participan en total en este Mundial 2026?",
        options: ["32 selecciones", "48 selecciones", "40 selecciones", "64 selecciones"],
        answer: 1
    },
    {
        question: "¿Cuáles son los tres países coanfitriones de este torneo?",
        options: ["Brasil, Argentina y Uruguay", "EE.UU., Canadá y México", "España, Portugal y Marruecos", "Corea, Japón y China"],
        answer: 1
    },
    {
        question: "Debido al nuevo formato, ¿qué ronda de eliminación directa se añade por primera vez?",
        options: ["Dieciseisavos de final", "Octavos de final", "Fase previa de repechaje", "Tercer lugar ampliado"],
        answer: 0
    },
    {
        question: "¿En qué histórico estadio de la Ciudad de México se jugó el partido inaugural?",
        options: ["Estadio BBVA", "Estadio Akron", "Estadio Azteca", "Estadio Olímpico Universitario"],
        answer: 2
    },
    {
        question: "¿Cuántas ciudades sedes albergan partidos del Mundial en total?",
        options: ["12 sedes", "16 sedes", "20 sedes", "10 sedes"],
        answer: 1
    },
    {
        question: "¿Dónde está programado jugarse el partido de la Gran Final del torneo?",
        options: ["SoFi Stadium (Los Ángeles)", "MetLife Stadium (Nueva York/Nueva Jersey)", "Azteca (Ciudad de México)", "AT&T Stadium (Dallas)"],
        answer: 1
    },
    {
        question: "¿Cuántos partidos totales se disputarán a lo largo de toda la Copa del Mundo 2026?",
        options: ["64 partidos", "80 partidos", "104 partidos", "96 partidos"],
        answer: 2
    },
    {
        question: "Cuál de estos países debuta organizando una Copa del Mundo absoluta masculina?",
        options: ["México", "Canadá", "Estados Unidos", "Ninguno, todos ya la organizaron"],
        answer: 1
    },
    {
        question: "El país que logre coronarse campeón del mundo tendrá que jugar un total de...",
        options: ["7 partidos", "8 partidos", "9 partidos", "6 partidos"],
        answer: 1
    },
    {
        question: "¿Cómo está conformada la primera fase de grupos en este formato?",
        options: ["8 grupos de 6 equipos", "16 grupos de 3 equipos", "12 grupos de 4 equipos", "10 grupos de 5 equipos"],
        answer: 2
    },
    {
        question: "¿Cuál es el número total de estadios elegidos en el territorio de Canadá?",
        options: ["2 estadios", "4 estadios", "1 estadio", "3 estadios"],
        answer: 0
    },
    {
        question: "¿Qué confederación continental ganó más cupos directos pasando de 5 a 9 clasificados?",
        options: ["CONMEBOL (Sudamérica)", "UEFA (Europa)", "CAF (África)", "AFC (Asia)"],
        answer: 2
    },
    {
        question: "¿En qué mes comenzó a rodar el balón en el partido de apertura de este mundial?",
        options: ["Mayo", "Junio", "Julio", "Noviembre"],
        answer: 1
    },
    {
        question: "Y en México, ¿cuántos estadios albergan partidos de este torneo?",
        options: ["5 estadios", "2 estadios", "3 estadios", "4 estadios"],
        answer: 2
    },
    {
        question: "¿Cuál es la única confederación que asegura al menos 16 representantes en el torneo?",
        options: ["CONMEBOL", "UEFA", "CONCACAF", "AFC"],
        answer: 1
    }
];

// Variables del estado del juego
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let playerNickname = "";

// Elementos del DOM
const welcomeScreen = document.getElementById('welcome-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultScreen = document.getElementById('result-screen');

const nicknameInput = document.getElementById('nickname-input');
const errorMsg = document.getElementById('error-msg');

const startBtn = document.getElementById('start-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const questionNumberTxt = document.getElementById('question-number');
const scoreCounterTxt = document.getElementById('score-counter');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

const userDisplay = document.getElementById('user-display');
const finalPointsTxt = document.getElementById('final-points');
const feedbackMsg = document.getElementById('feedback-msg');
const rankingBody = document.getElementById('ranking-body');

// Event Listeners
startBtn.addEventListener('click', validateAndStart);
nextBtn.addEventListener('click', setNextQuestion);
restartBtn.addEventListener('click', resetToWelcome);

// 1. Validar Nickname obligatorio e iniciar
function validateAndStart() {
    const enteredNick = nicknameInput.value.trim();
    
    if (enteredNick === "") {
        errorMsg.classList.remove('hide');
        nicknameInput.style.borderColor = "#dc3545";
        return;
    }
    
    errorMsg.classList.add('hide');
    nicknameInput.style.borderColor = "#ced4da";
    playerNickname = enteredNick;
    
    startQuiz();
}

// 2. Iniciar la trivia
function startQuiz() {
    welcomeScreen.classList.add('hide');
    resultScreen.classList.add('hide');
    quizScreen.classList.remove('hide');
    
    score = 0;
    currentQuestionIndex = 0;
    scoreCounterTxt.innerText = `Puntos: ${score}`;
    
    currentQuestions = [...questionsPool]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
        
    showQuestion();
}

// 3. Renderizar pregunta actual
function showQuestion() {
    resetQuestionState();
    
    const currentQuestion = currentQuestions[currentQuestionIndex];
    questionNumberTxt.innerText = `Pregunta ${currentQuestionIndex + 1} de 10`;
    questionText.innerText = currentQuestion.question;
    
    currentQuestion.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.innerText = option;
        button.classList.add('option-btn');
        button.addEventListener('click', () => selectOption(button, index));
        optionsContainer.appendChild(button);
    });
}

function resetQuestionState() {
    nextBtn.classList.add('hide');
    while (optionsContainer.firstChild) {
        optionsContainer.removeChild(optionsContainer.firstChild);
    }
}

// 4. Procesar respuesta seleccionada
function selectOption(selectedButton, index) {
    const currentQuestion = currentQuestions[currentQuestionIndex];
    const correctIndex = currentQuestion.answer;
    
    const allButtons = optionsContainer.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);
    
    if (index === correctIndex) {
        selectedButton.classList.add('correct');
        score++;
        scoreCounterTxt.innerText = `Puntos: ${score}`;
    } else {
        selectedButton.classList.add('incorrect');
        allButtons[correctIndex].classList.add('correct');
    }
    
    nextBtn.classList.remove('hide');
}

// 5. Avanzar o Terminar
function setNextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuestions.length) {
        showQuestion();
    } else {
        saveScoreAndShowResults();
    }
}

// 6. Guardar puntaje en Supabase y mostrar Ranking global
async function saveScoreAndShowResults() {
    quizScreen.classList.add('hide');
    resultScreen.classList.remove('hide');
    
    userDisplay.innerText = playerNickname;
    finalPointsTxt.innerText = `${score} / 10`;
    
    if (score === 10) feedbackMsg.innerText = "¡Perfecto! Eres una leyenda del fútbol mundial. 🥇";
    else if (score >= 7) feedbackMsg.innerText = "¡Excelente juego! Sabes muchísimo. 🥈";
    else if (score >= 4) feedbackMsg.innerText = "¡Buen intento! Cumpliste una actuación aceptable. 🥉";
    else feedbackMsg.innerText = "¡Sigue entrenando! El fútbol da revanchas.";

    try {
        // ENVIAR el nuevo puntaje a la tabla 'ranking' de Supabase
        await supabaseClient
            .from('ranking')
            .insert([{ name: playerNickname, points: score }]);

        // LEER e imprimir el ranking global actualizado desde la nube
        fetchAndRenderRanking();

    } catch (error) {
        console.error("Error al interactuar con Supabase:", error);
    }
}

// 7. Traer los datos ordenados en tiempo real desde la nube
async function fetchAndRenderRanking() {
    rankingBody.innerHTML = "<tr><td colspan='3'>Cargando ranking mundial...</td></tr>";
    
    try {
        const { data: ranking, error } = await supabaseClient
            .from('ranking')
            .select('*')
            .order('points', { ascending: false }) // Mayor puntaje primero
            .limit(10); // Top 10

        if (error) throw error;

        rankingBody.innerHTML = ""; // Limpiar mensaje de carga
        
        ranking.forEach((player, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.points} pts</td>
            `;
            rankingBody.appendChild(row);
        });
    } catch (error) {
        console.error("Error al traer el ranking:", error);
        rankingBody.innerHTML = "<tr><td colspan='3' style='color:red;'>Error al cargar el ranking</td></tr>";
    }
}

// 8. Botón para cambiar de usuario y reiniciar
function resetToWelcome() {
    nicknameInput.value = "";
    resultScreen.classList.add('hide');
    welcomeScreen.classList.remove('hide');
}
