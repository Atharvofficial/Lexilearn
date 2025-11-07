        const dictionaryAPI = "https://api.dictionaryapi.dev/api/v2/entries/en/";
        const randomWordAPI = "https://random-word-api.herokuapp.com/word?number=8";
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const loader = document.getElementById('loader');
        const resultsSection = document.getElementById('resultsSection');
        const randomWordsGrid = document.getElementById('randomWordsGrid');
        const randomWordsTitle = document.getElementById('randomWordsTitle');

        // Load random words on page load
        loadRandomWords();

        // Search button click
        searchBtn.addEventListener('click', () => searchWord());

        // Enter key press
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchWord();
        });

        async function searchWord() {
            const word = searchInput.value.trim();
            if (!word) return;

            showLoader();
            hideRandomWords();
            clearResults();

            try {
                const response = await axios.get(dictionaryAPI + word);
                displayFullResult(response.data);
            } catch (error) {
                displayNotFound();
            } finally {
                hideLoader();
            }
        }

        async function loadRandomWords() {
            try {
                const response = await axios.get(randomWordAPI);
                const words = response.data;
                
                for (const word of words) {
                    try {
                        const wordData = await axios.get(dictionaryAPI + word);
                        displayWordCard(wordData.data[0]);
                    } catch (error) {
                        // Skip words that don't have definitions
                        continue;
                    }
                }
            } catch (error) {
                console.error('Error loading random words:', error);
            }
        }

        function displayWordCard(data) {
            const card = document.createElement('div');
            card.className = 'word-card';
            
            const meaning = data.meanings[0];
            const definition = meaning.definitions[0].definition;
            const shortDef = definition.length > 100 ? definition.substring(0, 100) + '...' : definition;

            card.innerHTML = `
                <div class="word-title">${data.word}</div>
                ${data.phonetic ? `<div class="word-phonetic">${data.phonetic}</div>` : ''}
                <span class="part-of-speech">${meaning.partOfSpeech}</span>
                <div class="word-preview">${shortDef}</div>
            `;

            card.addEventListener('click', () => {
                searchInput.value = data.word;
                searchWord();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });

            randomWordsGrid.appendChild(card);
        }

        function displayFullResult(dataArray) {
            dataArray.forEach(data => {
                const card = document.createElement('div');
                card.className = 'result-card';

                let html = `
                    <div class="word-main">${data.word}</div>
                    ${data.phonetic ? `<div class="phonetic-text">${data.phonetic}</div>` : ''}
                `;

                // Audio players
                const audioPhonetics = data.phonetics.filter(p => p.audio);
                if (audioPhonetics.length > 0) {
                    html += '<div class="audio-player">';
                    audioPhonetics.forEach(phonetic => {
                        html += `
                            ${phonetic.text ? `<div style="margin-bottom: 10px; font-weight: 500;">${phonetic.text}</div>` : ''}
                            <audio controls>
                                <source src="${phonetic.audio}" type="audio/mpeg">
                            </audio>
                        `;
                    });
                    html += '</div>';
                }

                html += '<div class="meaning-section">';

                // Meanings
                data.meanings.forEach(meaning => {
                    html += `
                        <div class="meaning-box">
                            <div class="pos-title">${meaning.partOfSpeech}</div>
                    `;

                    meaning.definitions.forEach(def => {
                        html += `
                            <div class="definition-item">
                                <div class="definition-text">• ${def.definition}</div>
                                ${def.example ? `<div class="example-text">"${def.example}"</div>` : ''}
                            </div>
                        `;
                    });

                    html += '</div>';
                });

                html += '</div>';

                card.innerHTML = html;
                resultsSection.appendChild(card);
            });
        }

        function displayNotFound() {
            resultsSection.innerHTML = `
                <div class="result-card not-found">
                    <h2>Word Not Found</h2>
                    <p style="color: #666; margin-top: 10px;">Sorry, we couldn't find that word. Try searching for another one!</p>
                </div>
            `;
        }

        function showLoader() {
            loader.style.display = 'block';
        }

        function hideLoader() {
            loader.style.display = 'none';
        }

        function clearResults() {
            resultsSection.innerHTML = '';
        }

        function hideRandomWords() {
            randomWordsTitle.style.display = 'none';
            randomWordsGrid.style.display = 'none';
        }
        
