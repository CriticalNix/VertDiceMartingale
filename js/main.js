    var chat_parse = chrome.extension.getURL('js/mods/chat_parse.js');
    var bot_main = chrome.extension.getURL('js/mods/bot.js');
    var flot = chrome.extension.getURL('js/lib/jquery.flot.js');
	var flot = chrome.extension.getURL('js/mods/DISCLAIMER.js');

    function includeJS(jsFile) {
        $('head').append($('<script>').attr('type', 'text/javascript').attr('src', jsFile));
    }

    includeJS(chat_parse);
    includeJS(bot_main);
    includeJS(flot);