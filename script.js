document.addEventListener('DOMContentLoaded', () => {
    // Buttons
    const btnDyslexia = document.getElementById('btn-dyslexia');
    const btnAdhd = document.getElementById('btn-adhd');
    const btnSimplify = document.getElementById('btn-simplify');
    const btnListen = document.getElementById('btn-listen');
    
    // Content views
    const contentComplex = document.getElementById('content-complex');
    const contentSimple = document.getElementById('content-simple');
    
    // State
    let isDyslexiaMode = false;
    let isAdhdMode = false;
    let isSimplified = false;
    let isSpeaking = false;
    
    // Speech synthesis
    const synth = window.speechSynthesis;
    let utterance = null;

    // --- Dyslexia Mode Toggle ---
    btnDyslexia.addEventListener('click', () => {
        isDyslexiaMode = !isDyslexiaMode;
        document.body.classList.toggle('dyslexia-mode', isDyslexiaMode);
        
        btnDyslexia.classList.toggle('active', isDyslexiaMode);
        btnDyslexia.setAttribute('aria-pressed', isDyslexiaMode);
    });

    // --- ADHD Focus Mode Toggle ---
    btnAdhd.addEventListener('click', () => {
        isAdhdMode = !isAdhdMode;
        document.body.classList.toggle('adhd-mode', isAdhdMode);
        
        btnAdhd.classList.toggle('active', isAdhdMode);
        btnAdhd.setAttribute('aria-pressed', isAdhdMode);
    });

    // --- Simplify Text Toggle ---
    btnSimplify.addEventListener('click', () => {
        isSimplified = !isSimplified;
        
        if (isSimplified) {
            contentComplex.classList.remove('active');
            contentSimple.classList.add('active');
            btnSimplify.classList.add('active');
            btnSimplify.querySelector('.icon').innerText = '📚';
            btnSimplify.lastChild.textContent = ' Original Text';
        } else {
            contentSimple.classList.remove('active');
            contentComplex.classList.add('active');
            btnSimplify.classList.remove('active');
            btnSimplify.querySelector('.icon').innerText = '✨';
            btnSimplify.lastChild.textContent = ' Simplify Text';
        }
        btnSimplify.setAttribute('aria-pressed', isSimplified);
        
        // Stop speaking if switching content
        if (isSpeaking) {
            stopSpeaking();
        }
    });

    // --- Listen to Text Toggle (Text-to-Speech) ---
    btnListen.addEventListener('click', () => {
        if (isSpeaking) {
            stopSpeaking();
        } else {
            startSpeaking();
        }
    });

    function startSpeaking() {
        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            return;
        }

        const activeContent = isSimplified ? contentSimple : contentComplex;
        // Get all text blocks
        const paragraphs = activeContent.querySelectorAll('.text-block');
        
        let allText = '';
        paragraphs.forEach(p => {
            allText += p.innerText + ' ';
        });

        if (allText !== '') {
            utterance = new SpeechSynthesisUtterance(allText);
            
            // Adjust voice settings for better accessibility
            utterance.rate = 0.9; // Slightly slower for better comprehension
            utterance.pitch = 1;
            
            utterance.onstart = () => {
                isSpeaking = true;
                btnListen.classList.add('active');
                btnListen.querySelector('.btn-text').textContent = 'Stop Listening';
                btnListen.querySelector('.icon').innerText = '⏸️';
            };
            
            utterance.onend = () => {
                stopSpeaking();
            };
            
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                stopSpeaking();
            };

            // NOTE: Word boundary highlighting is complex with basic SpeechSynthesis API 
            // across different browsers, so we rely on the ADHD focus mode for visual tracking
            // or just the audio playback.

            synth.speak(utterance);
        }
    }

    function stopSpeaking() {
        synth.cancel();
        isSpeaking = false;
        btnListen.classList.remove('active');
        btnListen.querySelector('.btn-text').textContent = 'Listen to Text';
        btnListen.querySelector('.icon').innerText = '🔊';
    }

    // Clean up speech synthesis when leaving page
    window.addEventListener('beforeunload', () => {
        if (synth.speaking) {
            synth.cancel();
        }
    });
});
