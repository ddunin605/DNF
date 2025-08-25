function getFormattedDate() {
    let date = new Date();
    let year = date.getFullYear().toString().slice(-2); 
    let month = String(date.getMonth() + 1).padStart(2, '0'); 
    let day = String(date.getDate()).padStart(2, '0'); 
    let hours = String(date.getHours()).padStart(2, '0'); 
    let minutes = String(date.getMinutes()).padStart(2, '0'); 
    return `${year}${month}${day} ${hours}:${minutes}`;
}


function formatText(value) {
    value = value.replace(/,/g, '').trim(); 

    if (value.includes('억')) {
        let parts = value.split('억');
        let eok = parseFloat(parts[0].trim());
        let remainder = parts[1] ? parseFloat(parts[1].replace('만', '').trim()) : 0;
        return ((eok * 10000 + remainder) / 10000).toFixed(2);
    } else if (value.includes('만')) {
        return (parseFloat(value.replace('만', '').trim()) / 10000).toFixed(2);
    } else {
        return (parseFloat(value) / 100000000).toFixed(2);
    }
}


function formatBuffValue(value) {
    let num = parseInt(value.replace(/,/g, ''));
    return (num / 10000).toFixed(1);
}


const nicknameFixMap = {
    '무떠닝': '떠닝무',
    '도치떠닝': '떠닝도치',
    '원시오단': '시오단원',
    '소환열기': '열기소환',
};


let dealers = [];
let buffers = [];
let sconElements = document.querySelectorAll('.scon');

sconElements.forEach((scon) => {
    let nameElement = scon.querySelector('.seh_name .name');
    let serverElement = scon.querySelector('.seh_name .introd.server');
    let dealElement = scon.querySelector('.stat_a .val');
    let buffElement = scon.querySelector('.stat_b .val');
    let specialBuffElement = scon.querySelector('.stat_b > li:nth-child(3) > div > span.val');
    let jobElement = scon.querySelector('.seh_job .sev');

    if (nameElement) {
        let name = nameElement.textContent.trim();
        let server = serverElement ? serverElement.textContent.trim() : '';

        if (server) {
            name = name.replace(server, '').trim();
        }

        
        if (nicknameFixMap.hasOwnProperty(name)) {
            name = nicknameFixMap[name];
        }

        let job = jobElement ? jobElement.textContent.replace('眞 ', '').trim() : '직업 없음';
        let value = '';

        if (dealElement) {
            value = dealElement.textContent.trim();
            value = formatText(value);
            dealers.push({ name: name, job: job, value: value });
        } else if (job.includes('인챈트리스') && specialBuffElement) {
            value = specialBuffElement.textContent.trim();
            value = formatBuffValue(value);
            buffers.push({ name: name, job: job, value: value });
        } else if (buffElement) {
            value = buffElement.textContent.trim();
            value = formatBuffValue(value);
            buffers.push({ name: name, job: job, value: value });
        } else {
            value = 'No Value';
            dealers.push({ name: name, job: job, value: value });
        }
    }
});


dealers.sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
buffers.sort((a, b) => parseInt(b.value.replace(/[^\d]/g, '')) - parseInt(a.value.replace(/[^\d]/g, '')));


let dateTime = getFormattedDate();


let dealerResult = dealers.map(char => `${char.name} ${char.value}`).join('\n');
let bufferResult = buffers.map(char => `${char.name} ${char.value}`).join('\n');

let result = `${dateTime}\n${dealerResult}\n\n${bufferResult}`;


console.log(result);

const textArea = document.createElement('textarea');
textArea.value = result;
document.body.appendChild(textArea);
textArea.focus();
textArea.select();
try {
    const successful = document.execCommand('copy');
    if (successful) {
        console.log('Data copied to clipboard');
    } else {
        console.error('Failed to copy');
    }
} catch (err) {
    console.error('Failed to copy: ', err);
}
document.body.removeChild(textArea);
