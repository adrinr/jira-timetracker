var rapidViewUrl = 'rest/greenhopper/1.0/rapidview';
var sprintsViewUrl = 'rest/greenhopper/1.0/sprintquery/{rapidViewId}';
var sprintDetailUrl = 'rest/greenhopper/1.0/rapid/charts/sprintreport?rapidViewId={rapidViewId}&sprintId={sprintID}';
var issueDetailUrl = 'rest/api/2/issue/{issueIdOrKey}';
var logworkUrl = '/rest/api/2/issue/{issueIdOrKey}/worklog';

var getBoardsSuccess = function (result) {
	var boards = $.grep(result.views, function (item) {
			return item.name === 'FXStreet 3.0';
		});
	var board = boards[0];

	var url = globalSettings.Urls.JiraUrl + sprintsViewUrl;
	url = url.replace(/{rapidViewId}/, board.id)
		$.ajax({
			method : "GET",
			url : url,
			headers : {
				"Authorization" : globalSettings.Security.AuthorizeToken,
				"Access-Control-Allow-Origin" : "*"
			},
			dataType : "json",
			crossDomain : true
		})
		.done(function (result) {
			getBoardSuccess(result, board.id);
		});
};

var getBoardSuccess = function (result, boardId) {
	var sprints = $.grep(result.sprints, function (item) {
			return item.state === 'ACTIVE';
		});
	var sprint = sprints[0];
	var url = globalSettings.Urls.JiraUrl + sprintDetailUrl;
	url = url.replace(/{rapidViewId}/, boardId).replace(/{sprintID}/, sprint.id);
	$.ajax({
		method : "GET",
		url : url,
		headers : {
			"Authorization" : globalSettings.Security.AuthorizeToken,
			"Access-Control-Allow-Origin" : "*"
		},
		dataType : "json",
		crossDomain : true
	})
	.done(getSprintSuccess);
};

var getSprintSuccess = function (result) {
	var issuesList = content.find('#issuesList');
	$.each(result.contents.issuesNotCompletedInCurrentSprint, function (i, item) {
		issuesList.append($('<li >' + item.key + ' - ' + item.summary + '<ul id="' + item.key + '" /></li>'));
		var url = globalSettings.Urls.JiraUrl + issueDetailUrl;
		url = url.replace(/{issueIdOrKey}/, item.key);
		$.ajax({
			method : "GET",
			url : url,
			headers : {
				"Authorization" : globalSettings.Security.AuthorizeToken,
				"Access-Control-Allow-Origin" : "*"
			},
			dataType : "json",
			crossDomain : true
		})
		.done(getIssueSuccess);
	});
};

var getIssueSuccess = function (result) {
	$.each(result.fields.subtasks, function (i, item) {
		var list = content.find('ul#' + result.key);
		var li = $('<li id="' + item.key + '"/>');
		li.append('<button></button>');
		li.append("<label>" + item.key + ' - ' + item.fields.summary + "</label>");

		list.append(li);

		var button = li.find('button');
		button.on('click', clickButton);

		//<button style="background: url(myimage.png)" ... />
	});
};

var timer;

var clickButton = function () {
	var button = content.find('button.clicked').not(this);
	var issueToClose;
	if (button.length === 1) {
		button.removeClass('clicked');

		issueToClose = button;
		var time = getTime(new Date() - timer);
		content.find('#timer').append($('<div>' + time + '</div>'));
	}

	$(this).toggleClass('clicked');

	if ($(this).hasClass('clicked')) {
		timer = new Date();

		content.find('#timer').append($('<div>Started!</div>'));
	} else {
		issueToClose = $(this);
	}

	if (issueToClose) {
		var time = getTime(new Date() - timer);
		if (time > (60000)) {
			content.find('#timer').append($('<div>' + time + '</div>'));

			var url = globalSettings.Urls.JiraUrl + logworkUrl.replace(/{issueIdOrKey}/, issueToClose.parent().attr('id'));

			var data = {
				"started" : timer.toJSON(),
				"timeSpent" : time
			};
			$.ajax({
				method : "POST",
				url : url,
				headers : {
					"Authorization" : globalSettings.Security.AuthorizeToken,
					"Access-Control-Allow-Origin" : "*"
				},
				data : data,
				contentType : "application/json",
				crossDomain : true
			})
		};
	}
};

var getTime = function (milliseconds) {
	var hrs = Math.round((milliseconds) / 3600000); // hours
	var mins = Math.round(((milliseconds) % 3600000) / 60000); // minutes
	return hrs + 'h ' + mins + 'm';
};

function launch() {

	// create the original window
	chrome.app.window.create('window.html', {
		id : "mainwin",
		innerBounds : {
			top : 128,
			left : 128,
			width : 300,
			height : 300,
			minHeight : 300
		},
		frame : 'none'
	},
		onWindowCreated);
}

// @see http://developer.chrome.com/apps/app.runtime.html
chrome.app.runtime.onLaunched.addListener(launch);

var onWindowCreated = function (originalWindow) {
	originalWindow.contentWindow.document.addEventListener('DOMContentLoaded', onDOMContentLoaded);
};

var content;

var onDOMContentLoaded = function (e) {
	content = $(e.currentTarget);

	var url = globalSettings.Urls.JiraUrl + rapidViewUrl;

	$.ajax({
		method : "GET",
		url : url,
		headers : {
			"Authorization" : globalSettings.Security.AuthorizeToken,
			"Access-Control-Allow-Origin" : "*"
		},
		dataType : "json",
		crossDomain : true
	})
	.done(getBoardsSuccess);
};

var createLi = function (text) {
	var li = $('<li>' + text + '</li>');
	return li;
};

var onRapidViewUrl = function (response) {
	debugger;
	var rapidViewId = 18;
	var url = globalSettings.Urls.JiraUrl + sprintsViewUrl;
	url = url.replace(/{rapidViewId}/, rapidViewId);

	$.ajax({
		dataType : "json",
		url : globalSettings.Urls.JiraUrl + rapidViewUrl,
		data : data,
		success : onRapidViewUrl
	});
};
