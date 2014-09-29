/**
 * Created by dsds on 9/17/14.
 */

var api_domain = "http://www.douban.com/j/app";
var musics = [];
var channel_now = 0;

var network = {
    get_musics: function (callback) {
        if(authed) {
            network.get_user_musics(callback);
            return;
        }
        $.ajax({
            url: api_domain + "/radio/people?app_name=radio_desktop_win&version=100&channel=" + channel_now + "&type=n"
        }).done(function (data) {
            musics = data["song"];
            $.ajax({
                url: api_domain + "/radio/people?app_name=radio_desktop_win&version=100&channel=" + channel_now + "&type=n"
            }).done(function (data) {
                musics = musics.concat(data["song"]);
                callback();
            });
        });
    },
    get_user_musics: function (callback) {
        console.log("break point user musics");

        $.ajax({
            url: api_domain + "/radio/people?app_name=radio_desktop_win&version=100&channel=" + channel_now + "&type=n&user_id=" + user_id + "&expire=" + expire + "&token=" + token
        }).done(function (data) {
            musics = data["song"];
            if(channel_now == -3) {
                callback();
                return;
            }
            $.ajax({
                url: api_domain + "/radio/people?app_name=radio_desktop_win&version=100&channel=" + channel_now + "&type=n&user_id=" + user_id + "&expire=" + expire + "&token=" + token
            }).done(function (data) {
                musics = musics.concat(data["song"]);
                callback();
            });
        });
    },
    load_channels: function (callback) {
        if(authed) {
            network.get_user_channels(callback);
            return;
        }
        $.ajax({
            url: api_domain + "/radio/channels",
            error: function (data) {
                console.log("Error: ");
                console.log(data);
            },
            success: function (data) {
                channels = data["channels"];
                callback();
            }
        });
    },
    get_user_channels: function (callback) {
        $.ajax({
            url: api_domain + "/radio/channels",
            error: function (data) {
                console.log("Error: ");
                console.log(data);
            },
            success: function (data) {
                channels = [{"name_en":"Heart Radio","seq_id":0,"abbr_en":"My","name":"红心兆赫","channel_id":-3}];
                channels = channels.concat(data["channels"]);
                callback();
            }
        });
    },
    auth: function (email, password, callback) {
        $.ajax({
            url: api_domain + "/login?app_name=radio_desktop_win&version=100&email=" + email + "&password=" + password,
            type: "GET",
            error: function (data) {
                alert("登陆失败！请检查用户名以及密码。错误代码：" + data);
                console.log("Error: ");
                console.log(data);
            },
            success: function (data) {
                if(data["r"] == 0) {
                    token = data["token"];
                    expire = data["expire"];
                    user_name = data["user_name"];
                    user_email = data["email"];
                    user_id = data["user_id"];
                    authed = true;

                    window.localStorage.authed = authed;
                    window.localStorage.token = token;
                    window.localStorage.expire = expire;
                    window.localStorage.user_name = user_name;
                    window.localStorage.user_email = user_email;
                    window.localStorage.user_id = user_id;
                }
                $("#password").val("").hide();
                $("#login_btn").html("logout");

                network.load_channels(callback);

            }
        });
    },
    post_end_of_song: function (sid) {
        if(!authed)
            return;

        $.ajax({
            url: api_domain + "/radio/people?app_name=radio_desktop_win&version=100&channel=" + channel_now + "&type=e&user_id=" + user_id + "&expire=" + expire + "&token=" + token + "&sid=" + sid
        }).done(function (data) {
            console.log(data);
        });
    },
    get_music_info: function (id, callback) {
        /*
        $.ajax({
            url: "https://api.douban.com/v2/music/" + musics[id].aid,
            type: "GET",
            error: function (data) {
                console.log("Error: ");
                console.log(data);
            },
            success: function (data) {
                musics[id].info = data;
                if(musics[id].info.summary == "None")
                    musics[id].info.summary = "<span style='text-align:center'>无详细信息</span>";
                musics[id].info.summary = musics[id].info.summary.replace(/\\n/g, "<br/>");
                if(callback)
                    callback();
            }
        });
        */
        // return lyrics = =||
        // info from douban is really a mess
        $.ajax({
            url: "http://geci.me/api/lyric/" + musics[id].title + "/" + musics[id].artist,
            type: "GET",
            error: function (data) {
                musics[id].info = "未找到歌词 :(";
                if(callback)
                    callback();
            },
            success: function (data) {
                if(data.count == 0) {
                    musics[id].info = "未找到歌词 :(";
                    if(callback)
                        callback();
                }
                else {
                    $.ajax({
                        url: data.result[0].lrc,
                        type: "GET",
                        error: function (data) {
                            musics[id].info = "未找到歌词 :(";
                            if(callback)
                                callback();
                        },
                        success: function (data) {
                            console.log(data);
                            data = data.replace(/\[(.*)\]/g, '').trim();
                            data = data.replace(/\n/g, '\n<br />');
                            musics[id].info = data;
                            if(callback)
                                callback();
                        }
                    })
                }
            }
        });
    },
    update_music_like_info: function (sid, status) {
        if(!authed)
            return;

        console.log(api_domain + "/radio/people?app_name=radio_desktop_win&version=100&channel=" + channel_now + "&type=" + status + "&user_id=" + user_id + "&expire=" + expire + "&token=" + token + "&sid=" + sid);
        $.ajax({
            type: "GET",
            url: api_domain + "/radio/people?app_name=radio_desktop_win&version=100&channel=" + channel_now + "&type=" + status + "&user_id=" + user_id + "&expire=" + expire + "&token=" + token + "&sid=" + sid
        }).done(function (data) {
        });
    }
};