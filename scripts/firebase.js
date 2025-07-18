
const BASE_URL = "https://join-f4dc9-default-rtdb.europe-west1.firebasedatabase.app/";

async function loadData(path ="") {
	let response = await fetch(BASE_URL + path +".json");
    return responseToJson = await response.json();
}

async function postData(path="", data={}) {
    let response = await fetch(BASE_URL + path +".json",{
        method: "POST",
        header: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
}

async function deleteData(path="") {
     let response = await fetch(BASE_URL + path +".json",{
        method: "DELETE"
    });
    return responseToJson = await response.json();
}

async function putData(path="", data={}) {
     let response = await fetch(BASE_URL + path +".json",{
        method: "PUT",
        header: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    return responseToJson = await response.json();
}