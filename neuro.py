from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize

# download nltk resources
nltk.download('punkt')
nltk.download('stopwords')

app = Flask(__name__)
CORS(app)

# -----------------------------
# TEXT SIMPLIFICATION
# -----------------------------
def simplify_text(text):
    sentences = sent_tokenize(text)
    return " ".join(sentences[:3])


# -----------------------------
# KEYWORD EXTRACTION
# -----------------------------
def extract_keywords(text):
    words = word_tokenize(text)
    stop_words = set(stopwords.words("english"))

    keywords = [
        w for w in words
        if w.lower() not in stop_words and w.isalpha()
    ]

    return list(set(keywords))[:6]


HTML_PAGE = """
<!DOCTYPE html>
<html>
<head>
<title>NeuroLearn</title>

<style>

body{
font-family: Arial;
margin:40px;
background:#f0f0f0;
}

textarea{
width:100%;
height:150px;
font-size:16px;
padding:10px;
}

button{
padding:10px 20px;
margin-top:10px;
font-size:16px;
cursor:pointer;
}

#reader{
margin-top:30px;
padding:20px;
background:white;
border-radius:8px;
}

.dyslexia{
letter-spacing:2px;
line-height:1.8;
background:#fdf6e3;
font-size:20px;
}

.adhd{
font-size:22px;
max-width:700px;
}

.adhd p{
background:#ffffcc;
padding:10px;
}

</style>

</head>

<body>

<h1>NeuroLearn</h1>
<h3>Adaptive Learning Platform</h3>

<textarea id="inputText" placeholder="Paste academic text here"></textarea>

<br>

<label>
<input type="radio" name="mode" value="normal" checked> Normal
</label>

<label>
<input type="radio" name="mode" value="dyslexia"> Dyslexia Mode
</label>

<label>
<input type="radio" name="mode" value="adhd"> ADHD Focus Mode
</label>

<br><br>

<button onclick="simplifyText()">Simplify Text</button>

<div id="reader">

<h2>Simplified Content</h2>
<p id="summary"></p>

<button onclick="readAloud()">🔊 Read Aloud</button>

<h3>Keywords</h3>
<ul id="keywords"></ul>

</div>

<script>

setInterval(()=>{
if(Date.now()-lastScroll>15000){
document.getElementById("summary").innerText += 
"\n\nTip: Try simplifying the text again for better focus."
}
},5000)

function getMode(){
let radios = document.getElementsByName("mode")
for(let r of radios){
if(r.checked) return r.value
}
}

async function simplifyText(){

let text = document.getElementById("inputText").value

let response = await fetch("/simplify",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({text:text})
})

let data = await response.json()

document.getElementById("summary").innerText = data.summary

let list = document.getElementById("keywords")
list.innerHTML=""

data.keywords.forEach(k=>{
let li=document.createElement("li")
li.innerText=k
list.appendChild(li)
})

let mode = getMode()

let reader = document.getElementById("reader")
reader.className=""

if(mode==="dyslexia"){
reader.classList.add("dyslexia")
}

if(mode==="adhd"){
reader.classList.add("adhd")
}

}

function readAloud(){

let text = document.getElementById("summary").innerText
let speech = new SpeechSynthesisUtterance(text)
speechSynthesis.speak(speech)

}

</script>

</body>
</html>
"""

@app.route("/")
def home():
    return render_template_string(HTML_PAGE)

@app.route("/simplify", methods=["POST"])
def simplify():

    data = request.get_json()
    text = data["text"]

    simplified = simplify_text(text)
    keywords = extract_keywords(text)

    return jsonify({
        "summary": simplified,
        "keywords": keywords
    })

if __name__ == "__main__":
    app.run(debug=True)