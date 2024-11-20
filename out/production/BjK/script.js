const weekNr = 5;
loggedInUser = ""

logout()

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get the user's input
    const name = document.getElementById('name').value;
    const password = document.getElementById('password').value;

    // Check if the credentials are valid
    fetch('users.json')
        .then(response => response.json())  // Parse the JSON data
        .then(users => {
            const isNotRandomUser = users.find(user => user.name.toLowerCase() === name.toLowerCase());
            const randomUser = users.find(user => user.name.toLowerCase() === name.toLowerCase() && user.x !== null);
            const user = users.find(user => user.name.toLowerCase() === name.toLowerCase() && user.password === password);
            loggedInUser = user;

            if (user) {
                // If user found, show personalized content
                fetch('secret_santas.json')
                    .then(response => response.json())  // Parse the JSON data
                    .then(santas => {
                        const santa = santas.find(santa => santa.santa.toLowerCase() === name.toLowerCase());

                        document.getElementById('realContent').style.display = 'block';
                        document.getElementById('welcome').style.display = 'block';
                        document.getElementById('userName').textContent = user.name;
                        document.getElementById('toName').textContent = base64ToUtf8(santa.name);
                        document.getElementById('error').style.display = 'none';
                        document.getElementById('randomError').style.display = 'none';

                        // Optionally, store user login status in local storage to remember the login
                        localStorage.setItem('loggedInUser', JSON.stringify(user));
                        localStorage.setItem('loggedSanta', JSON.stringify(santa));
                        document.getElementById('loginForm').style.display = 'none';
                    })
                    .catch(error => console.error('Error fetching santa data:', error));
            } else {
                if (randomUser) {
                    document.getElementById('realContent').style.display = 'block';
                    document.getElementById('prayerMenu').style.display = 'none';
                    document.getElementById('randomWelcome').style.display = 'block';
                    document.getElementById('userName').textContent = randomUser.name;
                    document.getElementById('x').textContent = randomUser.x;
                    document.getElementById('error').style.display = 'none';
                    document.getElementById('randomError').style.display = 'none';
                    document.getElementById('loginForm').style.display = 'none';
                    localStorage.setItem('loggedInUser', JSON.stringify(user));
                } else {
                    if (!isNotRandomUser) {
                        document.getElementById('randomError').style.display = 'block';
                        document.getElementById('error').style.display = 'none';
                        document.getElementById('welcome').style.display = 'none';
                    }
                    else {
                        // If credentials are invalid, show error message
                        document.getElementById('error').style.display = 'block';
                        document.getElementById('randomError').style.display = 'none';
                        document.getElementById('welcome').style.display = 'none';
                    }
                }
            }
        })
        .catch(error => console.error('Error fetching user data:', error));
});

function base64ToUtf8(base64Str) {
    return decodeURIComponent(escape(atob(base64Str)));  // Decode from Base64
}

// Check if user is already logged in (using localStorage)
window.onload = function() {
    const loggedInUser = localStorage.getItem('loggedInUser');
    const loggedSanta = localStorage.getItem('loggedSanta');
    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        document.getElementById('welcome').style.display = 'block';
        document.getElementById('userName').textContent = user.name;
        document.getElementById('error').style.display = 'none';
        document.getElementById('loginForm').style.display = 'none';
    }
    if (loggedSanta) {
        const santa = JSON.parse(loggedSanta);
        document.getElementById('toName').textContent = base64ToUtf8(santa.name);
    }
};

// Handle Logout
document.getElementById('logoutButton')?.addEventListener('click', function() {
    logout()
});

function logout() {
    // Remove user data from localStorage
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('loggedSanta');
    // Hide welcome message and show login form
    document.getElementById('welcome').style.display = 'none';
    document.getElementById('randomWelcome').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('error').style.display = 'none';
    document.getElementById('randomError').style.display = 'none';
    document.getElementById('password').textContent = null;

    document.getElementById('realContent').style.display = 'none';
    document.getElementById('secretSantaContent').style.display = 'block';
    document.getElementById('prayersContent').style.display = 'none';
    document.getElementById('prayerMenu').style.display = 'block';

    document.getElementById('secretSantaMenu').classList.add("active")
    document.getElementById('prayerMenu').classList.remove("active")
    document.getElementById('pdfCanvas').style.display = 'none'

}

document.getElementById('secretSantaMenu')?.addEventListener('click', function() {
    document.getElementById('secretSantaMenu').classList.add("active")
    document.getElementById('prayerMenu').classList.remove("active")
    document.getElementById('secretSantaContent').style.display = 'block';
    document.getElementById('prayersContent').style.display = 'none';
    document.getElementById('pdfCanvas').style.display = 'none';
});

document.getElementById('prayerMenu')?.addEventListener('click', function() {
    setPrayers()
    document.getElementById('prayerMenu').classList.add("active")
    document.getElementById('secretSantaMenu').classList.remove("active")
    document.getElementById('prayersContent').style.display = 'block';
    document.getElementById('secretSantaContent').style.display = 'none';
});

function setPrayers(){
    const prayersList = document.getElementById('prayersList');
    prayersList.innerHTML = '';
    // document.getElementById('pdfCanvas').style.display = 'none'

    for (let i = 1; i <= weekNr; i++) {
        let button = document.createElement('button');
        button.textContent = `Nädal ${i}`;
        button.addEventListener('click', () => {
            loadPDF(`prayer/${loggedInUser.name}/Nädal ${i}.pdf`)
        });
        prayersList.appendChild(button);
    }
}

async function loadPDF(fileURL){
    const canvas = document.getElementById('pdfCanvas');
    const ctx = canvas.getContext('2d');

    // PDF.js setup
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    // Load PDF and render the first page
    const pdf = await pdfjsLib.getDocument(fileURL).promise;
    const page = await pdf.getPage(1); // Get the first page

    // Set canvas dimensions to fit the PDF page
    const viewport = page.getViewport({ scale: 1.5 }); // Scale for better quality
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Render PDF page to the canvas
    const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
    };
    await page.render(renderContext).promise;

    document.getElementById('pdfCanvas').style.display = 'block'
}