/**
 * Created by jack on 8/15/16.
 */
var contain = document.getElementById('contain');
var initThrow = document.getElementById('initThrow');
var pickForm = document.getElementById('pickForm');
var myBottle = document.getElementById('myBottle');
var userid = "";

//捡一个瓶子
pickForm.onclick = function () {
    pickBottle();
};

function pickBottle() {
    contain.style.opacity = '1';
    contain.style.zIndex = '2';
    xhr(null, 'get', '/api', function (err, result) {
        var bottleContent = '';
        if (err) return true;
        if (result.code == 302) {
            window.location.href = '/user/login';
        }
        if (result.id) {
            //漂流瓶id
            userid = result.id;
            var vals = result.result;
            if (vals.msg.owner) {
                bottleContent = '<p><span class="msg_owner">' + vals.msg.owner + '</span></p>' +
                    '<p class="msg_conent_p"><span class="msg_content">' + vals.msg.content + '</span></p>' +
                    '<p class="msg_select_p"><span class="msg_select"><input type="button" class="msg_cancle" onclick="showcontain()" value="扔回海里">' +
                    '<input type="button" class="msg_reply" value="回应" id="msg_reply" onclick="replymsg()"></span></p>'
            }
        }
        else {
            if (result && result.code == 1) {
                bottleContent = '<span class="title error">Oops,try again</span>' +
                    '<span  class="msg_return"><input type="button" onclick="showcontain()" value="返回"></span>';
            } else {
                bottleContent = '<span class="title timeFinish">' + result.msg + '</span>' +
                    '<span  class="msg_return"><input type="button" onclick="showcontain()" value="返回"></span>';
            }
        }
        contain.innerHTML = bottleContent;
        bottleContent = '';
    });
}

//扔瓶子页面
initThrow.onclick = function () {
    initThrowBottle();
};
function initThrowBottle() {
    contain.style.opacity = '1';
    contain.style.zIndex = '2';
    var throwForm = document.createElement('div');
    throwForm.className = "bottleContain";
    throwForm.innerHTML = '<textarea spellcheck="false" autofocus placeholder="写你所想..." class="bottleContent" required id="content" ></textarea>' +
        '<span><input type = "button" value = "再想想"   id=“btnthrow" onclick = "showcontain()" >' +
        '<input type = "submit" value = "扔一个"   id=“btnthrow" onclick = "throwBottle()" ></span>';
    contain.appendChild(throwForm);
}

//扔一个漂流瓶
function throwBottle() {
    var content = document.getElementById('content');
    if (checkInput(content.value)) {
        var time = Date.now();
        var datas = "content=" + content.value + "&time=" + time;
        xhr(datas, 'post', '/api', function (err, result) {
            if (err) {
                return true;
            } else if (result.code == 302) {
                window.location.href = '/user/login';
            }
            else {
                if (result.code && result.code === 1) {
                    alert('成功抛出');
                    showcontain();
                } else {
                    alert('Oops，something wrong');
                    showcontain();
                }
            }
        });
    } else {
        alert("大哥，不要黑我。。。・(PД`q｡)・゜・")
    }
}


//回应漂流瓶
function replymsg() {
    var msg_reply = document.getElementById('msg_reply');
    var msg_content = document.getElementsByClassName('msg_content')[0];
    var msg_conent_p = document.getElementsByClassName('msg_conent_p')[0];

    var newreply = document.createElement('div');
    newreply.className = 'newreply';
    newreply.innerHTML = '<textarea spellcheck="false" autofocus id="replyContent">';
    msg_conent_p.appendChild(newreply);

    var replyContent = document.getElementById('replyContent');
    replyContent.focus();
    msg_reply.style.backgroundColor = '#fff';
    msg_reply.style.color = '#57b4fc';
    msg_reply.setAttribute('onclick', 'sendReply()');
}

//发送回应
function sendReply() {
    var replyContent = document.getElementById('replyContent').value;
    if (checkInput(replyContent)) {
        var datas = "id=" + userid + "&content=" + replyContent;
        xhr(datas, 'post', '/reply', function (err, result) {
            if (err) {
            } else if (result.code == 302) {
                window.location.href = '/user/login';
            }
            else {
                if (result.code == 1) {
                    alert("成功了～");
                }
                else {
                    alert("失败～");
                }
                contain.innerHTML = '';
                listBottle();
            }
        })
    } else {
        alert('大哥，不要黑我。。。・(PД`q｡)・゜・')
    }
}


//我的瓶子
myBottle.onclick = function () {
    listBottle();
};

//列出瓶子
function listBottle() {
    xhr(null, 'get', '/userBottle', function (err, result) {
        if (err) {
            return true;
        }
        else if (result.code == 302) {
            window.location.href = '/user/login';
        }
        else {
            contain.style.opacity = '1';
            contain.style.zIndex = '2';
            contain.style.backgroundColor = '#f2f2f2';
            var msgsul = document.createElement('ul');
            msgsul.className = 'userBottleUl';

            var msgs = result.msg;
            for (var key in msgs) {
                var msgsli = document.createElement('li');
                msgsli.innerHTML = '<a class="msg_conent_a" "  href=' + msgs[key]._id + '><span class="msg_content_owner">' + msgs[key].message[0][0] + '</span><span class="msg_conent_bottles">' + msgs[key].message[0][2] + '</span></a>';
                msgsul.appendChild(msgsli);
            }
            var retrun_span = document.createElement('span');
            retrun_span.className = 'msg_return';
            retrun_span.innerHTML = '<input type="button" onclick="showcontain()" value="返回">';
            contain.appendChild(msgsul);
            contain.appendChild(retrun_span);
            var msg_conent_a_s = document.getElementsByClassName('msg_conent_a');
            for (var i = 0; i < msg_conent_a_s.length; i++) {
                msg_conent_a_s[i].onclick = function () {
                    flexContent(this.getAttribute('href'));
                    return false;
                }
            }
        }
    })
}

//填充详情
function flexContent(id) {
    xhr("id=" + id, 'post', '/bottle', function (err, result) {
        if (err) {
            return true;
        } else if (result.code == 302) {
            window.location.href = '/user/login';
        }
        else {
            contain.innerHTML = "";
            var msgsul = document.createElement('ul');
            msgsul.className = 'userBottleUl';
            var owner = result.msg.owner;
            var msgs = result.msg.message;
            for (var i = 0; i < msgs.length; i++) {
                var msgsli = document.createElement('li');
                if (msgs[i][0] == owner) {
                    msgsli.innerHTML = '<a><span class="msg_content_owner">' + msgs[i][0] + '</span><span class="msg_conent_bottles">' + msgs[i][2] + '</span></a>';

                } else {
                    msgsli.innerHTML = '<a><span class="msg_conent_bottles">' + msgs[i][2] + '</span><span class="msg_content_owner msg_content_owner_R">' + msgs[i][0] + '</span></a>';
                }
                msgsul.appendChild(msgsli);
            }
            var retrun_span = document.createElement('span');
            retrun_span.className = 'msg_return';
            retrun_span.innerHTML = '<input type="button" onclick="showcontain()" value="返回">';
            contain.appendChild(msgsul);
            contain.appendChild(retrun_span);
        }
    })
}

//展示主页
function showcontain() {
    contain.innerHTML = '';
    contain.style.opacity = '0';
    contain.style.zIndex = 0;
}

//输入检查
function checkInput(input) {
    var patrn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im;
    if (patrn.test(input)) {
        return false;
    }
    return true;
}
//xhr发送数据
function xhr(data, method, url, callback) {
    var xhr = new XMLHttpRequest();
    if (xhr) {
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onreadystatechange = function () {
            if ((xhr.readyState == 4) && (xhr.status == 200)) {
                callback(false, JSON.parse(xhr.responseText));
            } else {
                callback(true, "err");
            }
        };

    } else {
        return true;
    }
    xhr.send(data);
    return false;
}
