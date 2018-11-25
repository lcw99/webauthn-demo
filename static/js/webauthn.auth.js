'use strict';

/* Handle for register form submission */
$('#register').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;
    let name     = this.name.value;

    if(!username || !name) {
        alert('Name or username is missing!')
        return
    }

    getMakeCredentialsChallenge({username, name})
        .then((response) => {
            let publicKey = preformatMakeCredReq(response);
            publicKey.authenticatorSelection = {
                "authenticatorAttachment": "cross-platform",
                "requireResidentKey": true,
                "userVerification": "preferred"
            };
            console.log(publicKey);

            return navigator.credentials.create({ publicKey })
        })
		    .then((response) => {
                console.log(response);
		        let makeCredResponse = publicKeyCredentialToJSON(response);
		        return sendWebAuthnResponse(makeCredResponse)
		    })
		    .then((response) => {
		        if(response.status === 'ok') {
		            loadMainContainer()   
		        } else {
		            alert(`Server responed with error. The message is: ${response.message}`);
		        }
		    })
		    .catch((error) => alert(error))
})

/* Handle for login form submission */
$('#login').submit(function(event) {
    event.preventDefault();

    let username = this.username.value;

    if(!username) {
        alert('Username is missing!')
        return
    }

    getGetAssertionChallenge({username})
        .then((response) => {
            console.log("response.challenge=");
            console.log(response.challenge);
            let publicKey = preformatGetAssertReq(response);
            console.log("publicKey=");
            console.log(publicKey);
            //var chalArray8 = new Uint8Array(publicKey.challenge);
            //chalArray8.fill(1, 0, 32);
            publicKey.timeout = 60000;
            console.log(publicKey);
            //debugger
            var resp = navigator.credentials.get({ publicKey })
            return resp;
        })
        .then((response) => {
            let getAssertionResponse = publicKeyCredentialToJSON(response);
            console.log("getAssertionResponse=");
            console.log(getAssertionResponse);
            return sendWebAuthnResponse(getAssertionResponse)
        })
        .then((response) => {
            if(response.status === 'ok') {
                loadMainContainer()   
            } else {
                alert(`Server responed with error. The message is: ${response.message}`);
            }
        })
        .catch((error) => alert(error))
})

let getGetAssertionChallenge = (formBody) => {
    return fetch('/webauthn/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

let getMakeCredentialsChallenge = (formBody) => {
		console.log("getMakeCredentialsChallenge");
		console.log(formBody);
    return fetch('/webauthn/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}


let sendWebAuthnResponse = (body) => {
		console.log("sendWebAuthnResponse=");
 		console.log(body);
    return fetch('/webauthn/response', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
    .then((response) => response.json())
    .then((response) => {
        if(response.status !== 'ok')
            throw new Error(`Server responed with error. The message is: ${response.message}`);

        return response
    })
}

