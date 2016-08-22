/**
 * Created by jack on 8/22/16.
 */

var funForm = document.getElementById('funForm'),
    username = document.getElementById('username'),
    password = document.getElementById('password'),
    submit = document.getElementsByClassName('submit')[0];

if (username.value != '') {
    password.focus()
} else {
    username.focus()
}

var check = new Object({
    _username: document.getElementById('username'),
    nicknameRgx: /^[a-zA-z][a-zA-Z0-9_]{3,}$/,
    mailRgx: /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/,
    valid: function () {
        if ((check._username.value.toString().match(check.nicknameRgx) || (check._username.value.toString().match(check.mailRgx)))) {
            return true;
        } else {
            return false;
        }
    }
});


var funForm = document.getElementById('funForm');

funForm.onsubmit = function () {
    if (check.valid()) {
        submit.disable = true;
        var password = document.getElementById('password');
        var email = document.getElementById('email');
        var datas = "username=" + username.value + "&password=" + password.value + "&email=" + email.value;
        xhr(datas, 'post', '/user/signup', function (err, result) {
            if (err) {
                return true;
                submit.disable = false;
            } else {
                if (result.code == 200) {
                    window.location.href = '/';
                } else if (result.code == 201) {
                    alert(result.msg);
                } else if (result.code == 202) {
                    alert(result.msg)
                }
            }
            submit.disable = false;
            return false;
        });
        return false;
    } else {
        alert('username is invalid');
        return false;

    }
}
function xhr(data, method, url, callback) {
    var xhr = new XMLHttpRequest();
    if (xhr) {
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onreadystatechange = function () {
            if ((xhr.readyState == 4) && (xhr.status == 200)) {
                callback(false, JSON.parse(xhr.responseText))
            } else {
                callback(true)
            }
        };

    } else {
        return true;
    }
    xhr.send(data);
    return false;
}
