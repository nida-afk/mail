document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#compose-form').onsubmit = function(event) {
        event.preventDefault()

        // Post email to API route
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: document.querySelector('#compose-recipients').value,
                subject: document.querySelector('#compose-subject').value,
                body: document.querySelector('#compose-body').value
            })


        }).then(response => load_mailbox('sent'));

    }
    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#view').style.display = 'none';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#view').style.display = 'none';
    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            // Print emails

            for (email in emails) {

                let d = document.createElement('div');
                if (emails[email]['read'] === true) {
                    d.style.backgroundColor = '#909dac87';
                  }
                  else {

                    d.style.backgroundColor = 'white';
                  }
                d.innerHTML = `

                <div style="border: 1px solid blue; border-radius: 6px; padding: 5px;">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${emails[email]['sender']}</strong>
                        <span class="d-block">${emails[email]['subject']}</span>
                    </div>
                    <p class="mb-0" style = "font-size: small;">${emails[email]['timestamp']}</p>

        <button onclick="load(${emails[email]['id']})" class="btn btn-info">View</button>
    </div>
</div>


`;
       document.querySelector('#emails-view').append(d);

            }
            console.log(emails);
            // ... do something else with emails ...
        });
}

function load(id) {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#view').style.display = 'block';


v = document.querySelector('#view');

fetch('/emails/' +id , {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })

    fetch('/emails/' + id)
        .then(response => response.json())
        .then(email => {
            let arc = email['archived'] ?  "Unarchive" : "Archive" ;
            let c = email['archived'] ? "btn  btn-outline-success": "btn btn-outline-warning";




            v.innerHTML = `
            <ul class="list-group">
        <li class="list-group-item"><b>From: </b>  ${email['sender']}</li>
        <li class="list-group-item"><b>To: </b> ${email['recipients']} </li>

        <li class="list-group-item"><b>Time: </b> ${email['timestamp']}</li>
        <li class="list-group-item"><b>Subject: </b> ${email['subject']} </li>
      </ul>
      <p></p>
            <button class="btn btn-outline-info" id="reply" onclick = "reply('${email['id']}');">Reply</button>

      <button  class= "${c}" id="archive" onclick= "archive(${email['id']}, ${email['archived']});">${arc}</button>

            <hr>
            <div >   ${email.body} </div>
          `;

        });
}
function archive(id , val){
    fetch('/emails/'+ id, {
  method: 'PUT',
  body: JSON.stringify({
      archived: !val

  })
}).then(()=> {
    load_mailbox('inbox');

})
}
function reply(id) {
    fetch('/emails/'+ id)
    .then(response => response.json())
    .then(email => {
      compose_email();
      let r = email['subject'].slice(0, 2) === "Re" ? " " : "Re: ";
      document.querySelector('#compose-recipients').value = email['sender'];
      document.querySelector('#compose-subject').value = r + email['sender'] + "   " + email['subject'];

      document.querySelector('#compose-body').value = "On " +  email['timestamp']  + " - " + email['sender'] + " wrote:  " + email['body'] +  "\n";
    });


  }
