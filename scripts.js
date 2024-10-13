document.addEventListener('DOMContentLoaded', function() {
    const songContainer = document.getElementById('song-container');
    const playerModal = document.getElementById('player-modal');
    const backBtn = document.getElementById('back-btn');
    const audioPlayer = document.getElementById('audio-player');
    const progressBar = document.getElementById('progress-bar');
    const playBtn = document.getElementById('play-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const controlPanel = document.getElementById('music-control-panel');
    const controlPlayBtn = document.getElementById('control-play-btn');
    const controlNextBtn = document.getElementById('control-next-btn');
    const controlThumbnail = document.getElementById('control-thumbnail');
    const controlTitle = document.getElementById('control-song-title');
    const searchIcon = document.getElementById('search-icon');
    const searchPopup = document.getElementById('search-popup');
    const searchCloseBtn = document.getElementById('search-close-btn');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchButton = document.getElementById('search-button');
    // Existing variable declarations...

    // Add new variables for menu elements
    const menuIcon = document.getElementById('menu-icon');
    const menuPopup = document.getElementById('menu-popup');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const menuHome = document.getElementById('menu-home');
    const menuPlaylist = document.getElementById('menu-playlist');
    const menuDownloads = document.getElementById('menu-downloads');
    const menuSettings = document.getElementById('menu-settings');



    // Rest of the existing code...

// Add this code outside of the DOMContentLoaded event listener

    
    let playlist = [];
    let currentSongIndex = 0;
    let isPlaying = false;
            // Existing code...

    // Add menu functionality
    menuIcon.addEventListener('click', function() {
        console.log('Menu icon clicked'); // Add this line for debugging
        menuPopup.style.display = 'flex';
    });

    menuCloseBtn.addEventListener('click', function() {
        console.log('Close button clicked'); // Add this line for debugging
        menuPopup.style.display = 'none';
    });

    // Add event listeners for menu options
    menuHome.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Home clicked');
        menuPopup.style.display = 'none';
        // Add functionality for Home option
    });

    menuPlaylist.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Playlist clicked');
        menuPopup.style.display = 'none';
        // Add functionality for Playlist option
    });
    
    songContainer.innerHTML = '<div class="loader-home"></div>';

    menuDownloads.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Downloads clicked');
        menuPopup.style.display = 'none';
        // Add functionality for Downloads option
    });

    menuSettings.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Settings clicked');
        menuPopup.style.display = 'none';
        // Add functionality for Settings option
    });
    
    // Fetch song data from the charts web server
    
    fetch('https://apparent-karyn-nitinbhujwa-86b8a47b.koyeb.app/charts')
        .then(response => response.json())
        .then(data => {
            displaySongs(data);
        })
        .catch(error => console.error('Error fetching song data:', error));
        
    // Display songs dynamically on the homepage
    function displaySongs(songs) {
        const fragment = document.createDocumentFragment();
        songs.forEach(song => {
            const songCard = createSongCard(song);
            fragment.appendChild(songCard);
        });
        songContainer.appendChild(fragment);
    }

    function createSongCard(song) {
        songContainer.innerHTML = '';
        const songCard = document.createElement('div');

        songCard.classList.add('song-card');

        const thumbnailWrapper = document.createElement('div');
        thumbnailWrapper.classList.add('song-thumbnail-wrapper');

        const songThumbnail = document.createElement('img');
        songThumbnail.src = song.thumbnail;
        let ghd = song.title;
        songThumbnail.alt = ghd.length > 20 ? ghd.substring(0, 20) + "..." : ghd;
        songThumbnail.classList.add('song-thumbnail');
        thumbnailWrapper.appendChild(songThumbnail);

        songCard.appendChild(thumbnailWrapper);

        const songTitle = document.createElement('p');
        songTitle.textContent = ghd.length > 20 ? ghd.substring(0, 20) + "..." : ghd;
        songCard.appendChild(songTitle);

        const songViews = document.createElement('p');
        songViews.textContent = `Views: ${song.views}`;
        songCard.appendChild(songViews);

        const songArtists = document.createElement('p');
        songArtists.textContent = `Artists: ${song.artists}`;
        songCard.appendChild(songArtists);

        songCard.addEventListener('click', () => {
            createPlaylistAndPlay(song.videoId, song);
        });

        return songCard;
    }

    // Create a playlist using the clicked song's videoId and play it
    async function createPlaylistAndPlay(videoId, song) {
        updatePlayerAndControlPanel(song.thumbnail, song.title, song.artists, song.videoId);
        showControlPanel();
        openPlayerModal();
        stopCurrentSong();
        await playSong(song);
        const relatedSongs = await fetchRelatedSongs(videoId);
        playlist = [...relatedSongs];
        currentSongIndex = 0;
    }

    async function fetchRelatedSongs(videoId) {
    const fetchWithTimeout = (url, options, timeout = 3000) => {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Request timed out'));
            }, timeout);

            fetch(url, options)
                .then(response => {
                    clearTimeout(timer); // Clear the timeout on success
                    resolve(response);
                })
                .catch(err => {
                    clearTimeout(timer); // Clear the timeout on error
                    reject(err);
                });
        });
    };

    try {
        const response = await fetchWithTimeout(`https://get-related-songs.onrender.com/related_songs?video_id=${videoId}`, {}, 3000);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        return data;

    } catch (error) {
        console.error('Error fetching related songs:', error);
        return [];
    }
}

    async function playSong(song) {
        try {
            const audioUrl = await getAudioUrl(song.videoId);
            if (audioUrl) {
                audioPlayer.src = audioUrl;
                audioPlayer.play();
                isPlaying = true;
                syncProgressBar();
                playBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
                controlPlayBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
                audioPlayer.addEventListener('ended', playNextSong);
                playBtn.addEventListener('click', togglePlayPause);
                controlPlayBtn.addEventListener('click', togglePlayPause);
                
            } else {
                throw new Error('Failed to get audio URL');
            }
        } catch (error) {
            console.error('Error playing song:', error);
            // Handle the error (e.g., show a message to the user)
        }
    }

    function stopCurrentSong() {
        audioPlayer.pause();
        audioPlayer.currentTime = 0;
        audioPlayer.src = '';
        playBtn.innerHTML = '<img class="div-button" src="play-button.png">';
        controlPlayBtn.innerHTML = '<img class="div-button" src="play-button.png">';
        isPlaying = false;
        audioPlayer.removeEventListener('ended', playNextSong);
    }

    function togglePlayPause() {
        if (isPlaying) {
            audioPlayer.pause();
            playBtn.innerHTML = '<img class="div-button" src="play-button.png">';
            controlPlayBtn.innerHTML = '<img class="div-button" src="play-button.png">';
        } else {
            audioPlayer.play();
            playBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
            controlPlayBtn.innerHTML = '<img class="div-button" src="pause-button.png">';
        }
        isPlaying = !isPlaying;
    }

    async function playNextSong() {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
        const nextSong = playlist[currentSongIndex];
        updatePlayerAndControlPanel(nextSong.thumbnail, nextSong.title, nextSong.artists, nextSong.videoId);
        await playSong(nextSong);
    }

    prevBtn.addEventListener('click', async function() {
        currentSongIndex = (currentSongIndex === 0) ? playlist.length - 1 : currentSongIndex - 1;
        const prevSong = playlist[currentSongIndex];
        updatePlayerAndControlPanel(prevSong.thumbnail, prevSong.title, prevSong.artists, prevSong.videoId);
        await playSong(prevSong);
    });
    
    function encodeTitle(title){
        const originalString = title;

// Use encodeURIComponent to encode the string
    const encodedString = encodeURIComponent(originalString);
    
    // Replace specific characters manually
    const finalEncodedString = encodedString
      .replace(/%28/g, "(")
      .replace(/%29/g, ")")
      .replace(/%3A/g, "：")   // Full-width colon
      .replace(/%2C/g, ",")
      .replace(/%7C/g, "｜")   // Full-width vertical bar
      .replace(/%20/g, "%20"); // No change needed for %20 but keeping it for clarity
        console.log(finalEncodedString);
        return finalEncodedString;
    };

    function updatePlayerAndControlPanel(thumbnail, title, artists, videoId) {
        document.getElementById('player-thumbnail').src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
        document.getElementById('player-title').textContent = title.length > 20 ? title.substring(0, 20) + "..." : title;
        document.getElementById('player-artists').textContent = artists;
        document.getElementById('control-thumbnail').src = `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`;
        document.getElementById('control-song-title').textContent = title.length > 20 ? title.substring(0, 20) + "..." : title;
    }

    async function getAudioUrl(videoId) {
        try {
            const apiUrl = `https://ytdlp-direct-url.onrender.com/get-audio-url/${videoId}`;
            console.log(videoId);
            const response = await fetch(apiUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch data from API: ${response.status}`);
            }
            const data = await response.json();
            console.log('Stream URL:', data.streamUrl); // Logging the stream URL
            return data.streamUrl;
        } catch (error) {
            console.error("Error:", error.message);
            return null;
        }
    }

    function openPlayerModal() {
        playerModal.style.display = 'flex';
        history.pushState(null, null, 'player');
        window.addEventListener('popstate', function() {
            if (playerModal.style.display === 'flex') {
                closePlayerModal();
            }
        });
    }

    function closePlayerModal() {
        playerModal.style.display = 'none';
        history.back();
    }

    backBtn.addEventListener('click', closePlayerModal);

    function showControlPanel() {
        controlPanel.style.display = 'flex';
    }

    controlThumbnail.addEventListener('click', openPlayerModal);
    controlTitle.addEventListener('click', openPlayerModal);
    controlNextBtn.addEventListener('click', playNextSong);
    nextBtn.addEventListener('click', playNextSong);

    function syncProgressBar() {
        audioPlayer.addEventListener('timeupdate', () => {
            const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
            progressBar.value = progress;
        });
        progressBar.addEventListener('input', (e) => {
            const seekTime = (audioPlayer.duration * e.target.value) / 100;
            audioPlayer.currentTime = seekTime;
        });
    }

    // Search popup logic
    searchIcon.addEventListener('click', function() {
        searchPopup.style.display = 'flex';
    });

    searchCloseBtn.addEventListener('click', function() {
        searchPopup.style.display = 'none';
        searchResultsContainer.innerHTML = '';
        searchInput.value = '';
    });

    // Add event listener for the search button
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            fetchSongsByQuery(query);
        } else {
            searchResultsContainer.innerHTML = '<p>Please enter a search query.</p>';
        }
    });

    // Add event listener for the Enter key in the search input
    searchInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchButton.click();
        }
    });

    async function fetchSongsByQuery(query) {
        try {
            searchResultsContainer.innerHTML = '<div class="loader-search"></div><p style="top:50%;color:white;text-align:center;position:relative;">Searching...</p>';
            const response = await fetch(`https://get-related-songs.onrender.com/search_songs?query=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            displaySearchResults(data);
        } catch (error) {
            console.error('Error fetching search results:', error);
            searchResultsContainer.innerHTML = '<p>An error occurred while searching. Please try again.</p>';
        }
    }

    function displaySearchResults(songs) {
        searchResultsContainer.innerHTML = '';
        if (songs.length === 0) {
            searchResultsContainer.innerHTML = '<p>No results found.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        songs.forEach(song => {
            const songCard = createSearchResultCard(song);
            fragment.appendChild(songCard);
        });
        searchResultsContainer.appendChild(fragment);
    }

    function createSearchResultCard(song) {
        const songCard = document.createElement('div');
        songCard.classList.add('search-result-card');

        const thumbnailImg = document.createElement('img');
        thumbnailImg.src = `https://i.ytimg.com/vi/${song.videoId}/default.jpg`;
        thumbnailImg.alt = song.title;
        thumbnailImg.classList.add('search-result-thumbnail');

        const songInfo = document.createElement('div');
        songInfo.classList.add('search-result-info');

        const titleEl = document.createElement('h3');
        titleEl.textContent = song.title.length > 50 ? song.title.substring(0, 50) + "..." : song.title;
        titleEl.classList.add('search-result-title');

        const artistsEl = document.createElement('p');
        artistsEl.textContent = song.artists;
        artistsEl.classList.add('search-result-artists');

        songInfo.appendChild(titleEl);
        songInfo.appendChild(artistsEl);

        songCard.appendChild(thumbnailImg);
        songCard.appendChild(songInfo);

        songCard.addEventListener('click', () => {
            searchPopup.style.display = 'none';
            createPlaylistAndPlay(song.videoId, song);
        });

        return songCard;
    }
});