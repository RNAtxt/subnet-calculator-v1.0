function ipToInt(ip){
    return ip.split('.')
    .reduce((acc,octet)=>(acc<<8)+parseInt(octet),0)>>>0;
}

function intToIp(int){
    return [
        (int>>>24)&255,
        (int>>>16)&255,
        (int>>>8)&255,
        int&255
    ].join('.');
}

function hitungSubnet(){

    document.getElementById("hasil").innerHTML = "";
    
    showLoading(() => {

        prosesSubnet();

    });

}

function prosesSubnet(){

    const ip = document.getElementById("ip").value;
    const cidr = parseInt(document.getElementById("cidr").value);

    const ipInt = ipToInt(ip);

    const mask = (0xffffffff << (32-cidr)) >>> 0;

    const network = ipInt & mask;
    const broadcast = network | (~mask >>>0);

    let totalHost;
let firstHost;
let lastHost;

if(cidr === 32){
    totalHost = 1;
    firstHost = network;
    lastHost = network;
}
else if(cidr === 31){
    totalHost = 2;
    firstHost = network;
    lastHost = broadcast;
}
else{
    totalHost = Math.pow(2,32-cidr)-2;
    firstHost = network + 1;
    lastHost = broadcast - 1;
}

    document.getElementById("hasil").innerHTML = `
<div class="result-title">
    > RESULT
</div>

<div class="divider"></div>

<div class="result-row">
    <span>Network Address</span>
    <span>:</span>
    <span>${intToIp(network)}</span>
</div>

<div class="result-row">
    <span>Broadcast Address</span>
    <span>:</span>
    <span>${intToIp(broadcast)}</span>
</div>

<div class="result-row">
    <span>First Host</span>
    <span>:</span>
    <span>${intToIp(firstHost)}</span>
</div>

<div class="result-row">
    <span>Last Host</span>
    <span>:</span>
    <span>${intToIp(lastHost)}</span>
</div>

<div class="result-row">
    <span>Total Hosts</span>
    <span>:</span>
    <span>${totalHost}</span>
</div>

<div class="result-row">
    <span>Subnet Mask</span>
    <span>:</span>
    <span>${intToIp(mask)}</span>
</div>
`;

document.getElementById("kelasIP").innerHTML =
`Jenis IP : ${getIPClass(ip)}`;

document.getElementById("binaryResult").innerHTML =
visualizeBits(ip,cidr);

saveHistory(ip,cidr);
}

const cidrSelect = document.getElementById("cidr");

for(let i=1;i<=32;i++){
    const option = document.createElement("option");
    option.value = i;
    option.textContent = "/" + i;

    if(i === 24){
        option.selected = true;
    }

    cidrSelect.appendChild(option);
}

function toggleTheme(){
    document.body.classList.toggle("light-mode");
}

function getIPClass(ip){

    const first = parseInt(ip.split(".")[0]);

    if(first >=1 && first <=126)
        return "Class A";

    if(first >=128 && first <=191)
        return "Class B";

    if(first >=192 && first <=223)
        return "Class C";

    if(first >=224 && first <=239)
        return "Class D (Multicast)";

    return "Class E (Reserved)";
}

function ipToBinary(ip){

    return ip.split(".")
        .map(octet =>
            parseInt(octet)
            .toString(2)
            .padStart(8,"0")
        )
        .join(".");
}

function copyResult(){

    const text =
        document.getElementById("hasil").innerText;

    navigator.clipboard.writeText(text);

    alert("Copied successfully!");
}

function saveHistory(ip,cidr){

    let history =
        JSON.parse(localStorage.getItem("subnetHistory"))
        || [];

    history.unshift(`${ip}/${cidr}`);

    history = history.slice(0,10);

    localStorage.setItem(
        "subnetHistory",
        JSON.stringify(history)
    );

    renderHistory();
}

function renderHistory(){

    const history =
        JSON.parse(localStorage.getItem("subnetHistory"))
        || [];

    document.getElementById("history")
    .innerHTML = history
    .map(item =>
        `<div class="history-item">${item}</div>`
    )
    .join("");
}

document.getElementById("kelasIP")
.innerHTML =
`Jenis IP : ${getIPClass(ip)}`;

document.getElementById("binaryResult")
.innerHTML =
ipToBinary(ip);

saveHistory(ip,cidr);

function visualizeBits(ip,cidr){

    const binary =
        ip.split(".")
        .map(x =>
            parseInt(x)
            .toString(2)
            .padStart(8,"0")
        )
        .join("");

    let result = "";

    for(let i=0;i<32;i++){

        if(i < cidr){

            result +=
            `<span style="color:#22c55e">${binary[i]}</span>`;

        }else{

            result +=
            `<span style="color:#ef4444">${binary[i]}</span>`;
        }

        if((i+1)%8===0)
            result += " ";
    }

    return result;
}

document.getElementById("binaryResult")
.innerHTML =
visualizeBits(ip,cidr);

function showLoading(callback){

    const loading =
        document.getElementById("loading");

    const loadingText =
        document.getElementById("loadingText");

    loading.classList.remove("hidden");

    loadingText.innerHTML = "";

    const messages = [
        "[✓] Validating IP Address...",
        "[✓] Reading CIDR Prefix...",
        "[✓] Calculating Network Address...",
        "[✓] Calculating Broadcast Address...",
        "[✓] Calculating Host Range...",
        "[✓] Generating Report..."
    ];

    let i = 0;

    const interval = setInterval(() => {

        loadingText.innerHTML +=
            messages[i] + "\n";

        i++;

        if(i >= messages.length){

            clearInterval(interval);

            setTimeout(() => {

                loading.classList.add("hidden");

                callback();

            },500);
        }

    },250);

}



