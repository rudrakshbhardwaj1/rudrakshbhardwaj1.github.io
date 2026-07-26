const letters =
"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const numbers =
"0123456789".split("");

const symbols =
"!#$%&()*+".split("");

const generateBtn = document.getElementById("generateBtn");
const passwordBox = document.getElementById("password");
const copyBtn = document.getElementById("copyBtn");
const strength = document.getElementById("strength");

generateBtn.addEventListener("click", generatePassword);

function generatePassword(){

    const letterCount = Number(document.getElementById("letters").value);
    const symbolCount = Number(document.getElementById("symbols").value);
    const numberCount = Number(document.getElementById("numbers").value);

    let passwordArray=[];

    for(let i=0;i<letterCount;i++)
        passwordArray.push(randomItem(letters));

    for(let i=0;i<symbolCount;i++)
        passwordArray.push(randomItem(symbols));

    for(let i=0;i<numberCount;i++)
        passwordArray.push(randomItem(numbers));

    shuffle(passwordArray);

    animatePassword(passwordArray);
}

function randomItem(arr){
    return arr[Math.floor(Math.random()*arr.length)];
}

function shuffle(arr){

    for(let i=arr.length-1;i>0;i--){

        let j=Math.floor(Math.random()*(i+1));

        [arr[i],arr[j]]=[arr[j],arr[i]];
    }
}

function animatePassword(arr){

    passwordBox.value="";

    let i=0;

    let interval=setInterval(()=>{

        passwordBox.value+=arr[i];

        i++;

        if(i===arr.length){

            clearInterval(interval);

            checkStrength(passwordBox.value);

        }

    },80);

}

copyBtn.addEventListener("click",()=>{

    navigator.clipboard.writeText(passwordBox.value);

    copyBtn.innerText="Copied!";

    setTimeout(()=>{
        copyBtn.innerText="Copy";
    },1500);

});

function checkStrength(password){

    let score=0;

    if(password.length>=8)
        score++;

    if(/[A-Z]/.test(password))
        score++;

    if(/[0-9]/.test(password))
        score++;

    if(/[!#$%&()*+]/.test(password))
        score++;

    if(score<=2){

        strength.innerHTML="🔴 Weak Password";

        strength.style.color="red";

    }

    else if(score===3){

        strength.innerHTML="🟡 Medium Password";

        strength.style.color="orange";

    }

    else{

        strength.innerHTML="🟢 Strong Password";

        strength.style.color="green";

    }

}