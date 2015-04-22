/*
 * Copyright 2015 Liferay, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

liferay.screens.gallery = new liferay.classes.window();
liferay.screens.gallery.className = 'liferay.screens.gallery';

liferay.screens.gallery.render = function() {
	//Ti.API.info(this.className + ".render()");
	var self = this;

    this.panelBg = Titanium.UI.createView(liferay.settings.screens.all.layout.panelBg);

    var libButton = Titanium.UI.createView(liferay.settings.screens.gallery.buttons.library);
    libButton.width = liferay.tools.getDp(liferay.settings.screens.gallery.buttons.library.psize * Titanium.Platform.displayCaps.platformWidth);
    libButton.height = libButton.width;
    libButton.addEventListener('click', function(e) {
        liferay.tools.flashButton({
            control: e.source,
            onRestore: function() {
                liferay.screens.gallery.confirmName(function(name) {
                    liferay.flickr.uploadPhoto(name, liferay.screens.gallery.window, false, function() {
                        liferay.tools.toastNotification(e.source, L('GALLERY_THANKS'));
                    }, function(err) {
                        switch (err) {
                            case Titanium.Media.DEVICE_BUSY:
                                liferay.tools.alert(L('ALERT'), L('GALLERY_CAMERA_BUSY'));
                                break;
                            case Titanium.Media.NO_CAMERA:
                                liferay.tools.alert(L('ALERT'), L('GALLERY_NO_CAMERA'));
                                break;
                            default:
                                liferay.tools.alert(L('ALERT'), String.format(L('GALLERY_UNKNOWN_ERROR'), err));
                                break;
                        }
                    });
                });
            }
        });
    });

    libButton.addEventListener('longpress', function(e) {
        liferay.tools.flashButton({
            control: e.source,
            onRestore: function() {
                liferay.screens.gallery.clearConfirmedName();
                liferay.screens.gallery.saveConfirmedNames();
            }
        });
    });

    var camButton = Titanium.UI.createView(liferay.settings.screens.gallery.buttons.camera);
    camButton.width = liferay.tools.getDp(liferay.settings.screens.gallery.buttons.camera.psize * Titanium.Platform.displayCaps.platformWidth);
    camButton.height = camButton.width;
    camButton.addEventListener('click', function(e) {
        liferay.tools.flashButton({
            control: e.source,
            onRestore: function() {
                liferay.screens.gallery.confirmName(function(name) {
                    liferay.flickr.uploadPhoto(name, liferay.screens.gallery.window, true, function() {
                        liferay.tools.toastNotification(e.source, L('GALLERY_THANKS'));
                    }, function(err) {
                        switch (err) {
                            case Titanium.Media.DEVICE_BUSY:
                                liferay.tools.alert(L('ALERT'), L('GALLERY_CAMERA_BUSY'));
                                break;
                            case Titanium.Media.NO_CAMERA:
                                liferay.tools.alert(L('ALERT'), L('GALLERY_NO_CAMERA'));
                                break;
                            default:
                                liferay.tools.alert(L('ALERT'), String.format(L('GALLERY_UNKNOWN_ERROR'), err));
                                break;
                        }
                    });
                });
            }
        });
    });
    camButton.addEventListener('longpress', function(e) {
        liferay.tools.flashButton({
            control: e.source,
            onRestore: function() {
                liferay.screens.gallery.clearConfirmedName();
                liferay.screens.gallery.saveConfirmedNames();
            }
        });
    });

    if (!Titanium.Media.isCameraSupported) {
        camButton.visible = false;
    }

    this.window = liferay.ui.makeWindow({
        backEnabled: true,
        swipe: true,
        panelBg: this.panelBg,
        footerButtons: [libButton, camButton],
        headerListeners: [{
            event: 'longpress',
            listener: function(e) {
                liferay.screens.front.window.add(liferay.screens.front.tf);
                liferay.screens.front.beaconLightsEnabled = true;
                setInterval(function() {
                    liferay.screens.front.tf.text = JSON.stringify(liferay.beacons.currentRegions) + JSON.stringify(liferay.beacons.currentBeacons);
                }, 1000);

                liferay.screens.front.beaconButton.addEventListener('longpress', function(e) {
                    e.source.backgroundColor = 'red';
                    liferay.beacons.clearAllHistoryAndPrefs();
                    setTimeout(function() {
                        e.source.backgroundColor = 'transparent';
                    }, 5000);
                });
                liferay.screens.front.beaconButtonOff.addEventListener('longpress', function(e) {
                    e.source.backgroundColor = 'red';
                    liferay.beacons.clearAllHistoryAndPrefs();
                    setTimeout(function() {
                        e.source.backgroundColor = 'transparent';
                    }, 5000);
                });
            }
        }]
    });


	/// gallery specific logic for render()
	liferay.screens.gallery.confirmedNames = [];

	this.panelBg.layout = 'vertical';

	var tabContainer = Ti.UI.createView({
		layout: 'horizontal',
		height: '8%',
		width: '100%',
		left: 0,
		top: 5
	});

	this.eventBtns = [];
	var tabWidth = liferay.tools.getDp(.25 * Titanium.Platform.displayCaps.platformWidth);

	// build sorted table
	liferay.data.currentEventData.galleries.sortBy('position');

	for (var i = 0; i < liferay.data.currentEventData.galleries.length; i++) {
		var item = liferay.data.currentEventData.galleries[i];

		var eventBtn = Titanium.UI.createView({
			width: tabWidth,
			height: '100%',
			backgroundImage: liferay.settings.screens.agenda.layout.dayBtn.backgroundImage,
			btnIndex: i,
			touchEnabled: true
		});

		var eventBtnLbl  = Titanium.UI.createLabel({
			text: item.title,
			font : liferay.fonts.h1,
			color: '#444444',
			backgroundColor: 'transparent',
			top: '30%',
			touchEnabled: false
		});

		eventBtn.add(eventBtnLbl);
		tabContainer.add(eventBtn);
		this.eventBtns.push(eventBtn);

		eventBtn.addEventListener('click', function(e) {
			if (liferay.screens.gallery.selectedEvent != e.source.btnIndex) {
				self.selectEvent(e.source.btnIndex);
			}
		});
	}
	this.panelBg.add(tabContainer);
	var tabBase = Titanium.UI.createView(liferay.settings.screens.agenda.layout.tabBase);

	this.panelBg.add(tabBase);

	this.window.addEventListener('open', function(e) {
		liferay.screens.gallery.selectEvent(0);
	});

	return this.window;
};

liferay.screens.gallery.confirmName = function(cb) {

	liferay.screens.gallery.loadConfirmedNames();
	var confirmedName = liferay.screens.gallery.getConfirmedName();

	if (confirmedName && confirmedName.dontAsk) {
		cb("");
		return;
	}

	if (confirmedName && confirmedName.name) {
		cb(confirmedName.name);
		return;
	}

	var alertDialog = Titanium.UI.createAlertDialog({
		title : L('ADD_NAME'),
		message: L('ADD_NAME_DESC'),
		buttonNames : [L('YES'), L('NO'), L('CANCEL')],
		cancel: 2
	});
	alertDialog.addEventListener('click', function(e) {
		if (e.index == 0) {
			var evt = liferay.controller.selectedEvent;
			var questions = [liferay.screens.gallery.makeHeaderField("NAME", L('FMT_NAME').toUpperCase(),
				null, '15dp', function (e) {
					liferay.screens.gallery.recordConfirmedName(e.value, false);
					liferay.screens.gallery.saveConfirmedNames();
				})];

			liferay.screens.gallery.showSimpleForm({
				title : L('ADD_NAME'),
				subTitle: liferay.controller.selectedEvent.menutitle,
				subHeading: liferay.controller.selectedEvent.location_label.toUpperCase(),
				instructions: L('ADD_NAME_INSTRUCTIONS'),
				questions: questions,
				submitTitle: L('OK'),
				submitConfirm: L('ADD_NAME_CONFIRM'),
				closeTitle: L('CANCEL'),
				onSubmit: function(onSuccess, onFail) {
					var newname = liferay.screens.gallery.getConfirmedName().name;
					if (onSuccess) onSuccess();
					cb(newname.trim());
				}, validate: function() {
					var newname = questions[0].value;
					if (!newname || !newname.trim()) {
						return {
							result: false,
							msg: L('PLEASE_ENTER_NAME')
						};
					}
					return {
						result: true
					};
				}
			});

		} else if (e.index == 1) {
			liferay.screens.gallery.recordConfirmedName("", true);
			liferay.screens.gallery.saveConfirmedNames();
			cb("");
			return;
		} else {
			return;
		}
	});
	alertDialog.show();


};

liferay.screens.gallery.selectEvent = function(idx) {

	liferay.screens.gallery.selectedEvent = idx;
	for (var i = 0; i < liferay.screens.gallery.eventBtns.length; i++) {
		var btn = liferay.screens.gallery.eventBtns[i];
		if (i == idx) {
			btn.backgroundImage = liferay.settings.screens.agenda.layout.dayBtn.backgroundImageAlt;
			btn.getChildren()[0].color = 'white';
		} else {
			btn.backgroundImage = liferay.settings.screens.agenda.layout.dayBtn.backgroundImage;
			btn.getChildren()[0].color = '#444444';
		}
	}

	var gal = liferay.data.currentEventData.galleries[idx];
	if (!gal) {
		liferay.tools.alert(L('ALERT'), L('GALLERY_NO_PICS'));
	} else {
		this.loadPictures(gal);
	}
}

liferay.screens.gallery.loadPictures = function(gallery) {
	//Ti.API.info(this.className + ".loadPictures()");
	var self = this;
	var photoset = gallery.photosetid;
	var canRate = gallery.rateable;

	if (Titanium.Network.online == false) {
		var dialog = Titanium.UI.createAlertDialog({
			title : L('GALLERY_CANNOT_LOAD_TITLE'),
			message : L('GALLERY_CANNOT_LOAD_MSG'),
			buttonNames : [L('OK')]
		});
		dialog.addEventListener('click', function() {
			liferay.controller.closeLast(true);
		});
		dialog.show();
		return;
	}

	liferay.tools.createFloatingMessage({
		container : liferay.screens.gallery.window
	});

	var xhr = Titanium.Network.createHTTPClient();
	xhr.timeout = liferay.settings.server.requestTimeout;
	xhr.onload = function() {
		var resp;
		try {
			resp = JSON.parse(this.responseText);
		} catch (ex) {
			liferay.tools.hideFloatingMessage();
			liferay.tools.alert(L('ALERT'), L('GALLERY_CHECK_SETTINGS'));
		}
		if (resp.stat != "ok") {
			liferay.tools.hideFloatingMessage();
			liferay.tools.alert(L('ALERT'), String.format(L('GALLERY_CANNOT_LOAD_ERROR'), resp.message));
		} else {
			var photosetdata = resp.photoset;
			var photos = photosetdata.photo;
			var photocount = photosetdata.total;
			//Ti.API.info("photos: " + this.responseText);
			if (!photos) {
				liferay.tools.hideFloatingMessage();
				liferay.tools.alert(L('ALERT'), L('GALLERY_CANNOT_DISPLAY'));
			} else {
				self.data = {};
				if ( photos instanceof Array) {
					self.data.photo = photos;
				} else {
					self.data.photo = [];
					self.data.photo.push(photos);
				}

				self.data.photo.forEach(function(el) {
					el.photosetid = photoset;
				});

				try {
					self.displayPictures(canRate);
				} catch (e) {
					liferay.tools.hideFloatingMessage();
				}
			}

		}
	};
	xhr.onerror = function(err) {
		liferay.tools.hideFloatingMessage();
		liferay.tools.alert(L('ALERT'), L('GALLERY_TIMEOUT'));
	};

	var url = "https://api.flickr.com/services/rest/?method=flickr.photosets.getPhotos" + "&api_key=" +
	Ti.App.Properties.getString('liferay.flickr.api_key') + "&photoset_id=" + photoset + "&per_page=" +
		liferay.settings.screens.gallery.itemsPerPage + "&format=json&nojsoncallback=1&extras=url_s,url_m,url_t,url_sq";

	xhr.open('GET', url);
	xhr.send();
};

liferay.screens.gallery.displayPictures = function(canRate) {
	var self = this;

	if (this.scrollView) {
		this.panelBg.remove(this.scrollView);
	}

	this.scrollView = Titanium.UI.createScrollView({
        width: "95%",
        height: "91%",
        contentHeight: "auto",
        contentWidth: "auto",
        left: "2.5%",
        showVerticalScrollIndicator: true,
        showHorizontalScrollIndicator: false
    });

	var scrollContainer = Ti.UI.createView({
		height: Ti.UI.SIZE,
		width: Ti.UI.FILL,
		layout: 'vertical',
		top: 0,
		left: 0
	});

	this.scrollView.add(scrollContainer);

	var sepWidth = liferay.tools.getDp(7);
	var picsPerRow = 4;
	if (Titanium.Platform.displayCaps.platformWidth > 500) {
		picsPerRow = 7;
	}
	var areaWidth = liferay.tools.getDp(.95 * Titanium.Platform.displayCaps.platformWidth);

	var picWidth = (areaWidth - (sepWidth * (picsPerRow - 1))) / picsPerRow;

	var picHeight = picWidth;

	if (!self.data.photo.length) {
		liferay.tools.hideFloatingMessage();
		this.scrollView.add(Titanium.UI.createLabel({
			text : L('GALLERY_NO_PICS')
		}));
		this.panelBg.add(this.scrollView);
		return;
	}
	for (var i = 0; i < self.data.photo.length; i+= picsPerRow) {
		var row = Titanium.UI.createView({
			layout : 'horizontal',
			horizontalWrap: false,
			width : Ti.UI.FILL,
			height : Ti.UI.SIZE,
			top : sepWidth,
			left : 0
		});

		for (var j = 0; (j < picsPerRow) && ((i + j) < self.data.photo.length); j++) {
			var photo = self.data.photo[i + j];
			photo.canRate = canRate;
			var url = photo.url_sq;
			var left = sepWidth;
			if (j == 0) {
				left = 0;
			}

			var imgView = Ti.UI.createImageView({
				image : url,
				height : picHeight,
				width : picWidth,
				left : left,
				touchEnabled : true,
				backgroundColor : 'transparent',
				preventDefaultImage : true,
				enableZoomControls : false,
				pIndex : i + j
			});
			imgView.addEventListener('click', function(e) {
				if (liferay.model.android) {
					liferay.controller.open(liferay.screens.galleryDetail.render(), liferay.screens.galleryDetail);
					liferay.screens.galleryDetail.loadDetails(e.source.pIndex);
				} else {
					liferay.tools.expandButton({
						control: e.source,
						onRestore: function() {
							liferay.controller.open(liferay.screens.galleryDetail.render(), liferay.screens.galleryDetail);
							liferay.screens.galleryDetail.loadDetails(e.source.pIndex);
						}
					});
				}
			});
			row.add(imgView);
		}
		scrollContainer.add(row);
	}

	this.panelBg.add(this.scrollView);
	liferay.tools.hideFloatingMessage();
};


//confirmedNames: [
//	{
//		eventid: id,
//		name: name,
//		dontAsk: boolean
//	},...]

liferay.screens.gallery.getConfirmedName = function () {
	for (var i = 0; i < liferay.screens.gallery.confirmedNames.length; i++) {
		if (liferay.screens.gallery.confirmedNames[i].eventId == liferay.controller.selectedEvent.eventid) {
			return liferay.screens.gallery.confirmedNames[i];
		}
	}
	return null;
}

liferay.screens.gallery.recordConfirmedName = function (name, dontAsk) {

	for (var i = 0; i < liferay.screens.gallery.confirmedNames.length; i++) {
		if (liferay.screens.gallery.confirmedNames[i].eventId == liferay.controller.selectedEvent.eventid) {
			liferay.screens.gallery.confirmedNames[i].name = name;
			liferay.screens.gallery.confirmedNames[i].dontAsk = dontAsk;
			return;
		}
	}
	liferay.screens.gallery.confirmedNames.push({
		eventId: liferay.controller.selectedEvent.eventid,
		name: name,
		dontAsk: dontAsk
	});
};

liferay.screens.gallery.clearConfirmedName = function () {

	for (var i = 0; i < liferay.screens.gallery.confirmedNames.length; i++) {
		if (liferay.screens.gallery.confirmedNames[i].eventId == liferay.controller.selectedEvent.eventid) {
			liferay.screens.gallery.confirmedNames.splice(i, 1);
		}
	}
};

liferay.screens.gallery.loadConfirmedNames = function () {
	liferay.screens.gallery.confirmedNames = [];
	var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, liferay.settings.screens.loader.galleryFile);
	if (file.exists()) {
        try {
            liferay.screens.gallery.confirmedNames = JSON.parse(file.read());
        } catch (ex) {
            liferay.screens.gallery.confirmedNames = [];
        }
		return true;
	}
	return false;
};

liferay.screens.gallery.saveConfirmedNames = function () {
	var folder = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory);
	if (!folder.exists()) {
		folder.createDirectory();
		folder.remoteBackup = true;
	}
	var file = Titanium.Filesystem.getFile(Titanium.Filesystem.applicationDataDirectory, liferay.settings.screens.loader.galleryFile);

	file.write(JSON.stringify(liferay.screens.gallery.confirmedNames));
	file.remoteBackup = true;
};

liferay.screens.gallery.showSimpleForm = function(options) {
    var formShader = Ti.UI.createView({
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'black',
        opacity:0.85
    });

    var formRound = Ti.UI.createView({
        left: '5%',
        top: '5%',
        width: '90%',
        height: '90%',
        backgroundColor: 'white',
        borderRadius: '10dp',
        borderWidth: '5dp',
        borderColor: 'white',
        layout: 'vertical'
    });

    var formScroll = Ti.UI.createScrollView({

        left: '5%',
        top: '2.5%',
        width: '90%',
        height: '80%',
        scrollType: 'vertical',
        showHorizontalScrollIndicator:false,
        showVerticalScrollIndicator: true,
        contentWidth: 'auto',
        backgroundColor: 'transparent',
        contentHeight: 'auto'
    });

    var formContainer = Ti.UI.createView({
        left: 0,
        top: 0,
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        backgroundColor: 'transparent',
        layout: 'vertical'
    });

    formContainer.add(Ti.UI.createLabel({
        top: 0,
        left: 0,
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        text: options.title.toUpperCase(),
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        font: liferay.fonts.h4,
        color: '#84A8C8'
    }));

    formContainer.add(Ti.UI.createLabel({
        top: '2dp',
        left: 0,
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        text: options.subTitle,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        font: liferay.fonts.h3,
        color: '#84A8C8'
    }));

    formContainer.add(Ti.UI.createLabel({
        top: '2dp',
        left: 0,
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        text: options.subHeading,
        textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
        font: liferay.fonts.h1,
        color: '#84A8C8'
    }));

    formContainer.add(Ti.UI.createLabel({
        top: '5dp',
        left: 0,
        width: Ti.UI.FILL,
        height: Ti.UI.SIZE,
        text: options.instructions,
        textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT,
        font: liferay.fonts.h2,
        color: 'black'
    }));

    options.questions.forEach(function(el) {
        formContainer.add(el);
    });

    // a little space at the bottom
    formContainer.add(Ti.UI.createView({
        left: 0,
        top: 0,
        width: Ti.UI.FILL,
        height: '25dp',
        backgroundColor: 'transparent'
    }));

    var btnContainer = Ti.UI.createView({
        bottom: 0,
        left: 0,
        width: Ti.UI.FILL,
        height: '15%'
    });

    var btnCenterer = Ti.UI.createView({
        width: Ti.UI.SIZE,
        height: Ti.UI.SIZE,
        layout: 'horizontal'
    });

    var submitBtn = Ti.UI.createButton({
        title: '  ' + options.submitTitle + '  ',
        font: {
            fontSize: liferay.fonts.H4Size
        },
        backgroundImage: liferay.settings.screens.survey.buttons.backgroundImage,
        backgroundColor: 'transparent',
        color: 'white'
    });
    var closebtn = Ti.UI.createButton({
        title: '  ' + options.closeTitle + '  ',
        font: {
            fontSize: liferay.fonts.H4Size
        },
        left: '50dp',
        backgroundImage: liferay.settings.screens.survey.buttons.backgroundImage,
        backgroundColor: 'transparent',
        color: 'white'
    });

    closebtn.addEventListener('click', function(e) {
        liferay.controller.getCurrentWindow().remove(formShader);
        liferay.controller.getCurrentWindow().remove(formRound);
    });
    submitBtn.addEventListener('click', function(e) {

        if (options.validate) {
            var result = options.validate();
            if (!result.result) {
                liferay.tools.alert(L('ALERT'), result.msg);
                return;
            }
        }

        var alertDialog = Titanium.UI.createAlertDialog({
            title : options.title,
            message : options.submitConfirm,
            buttonNames : [L('YES'), L('NO')]
        });
        alertDialog.addEventListener('click', function(e) {
            if (e.index == 0) {
                options.onSubmit(function() {
                    liferay.controller.getCurrentWindow().remove(formShader);
                    liferay.controller.getCurrentWindow().remove(formRound);
                });
            }
        });

        alertDialog.show();
    });

    options.questions[0].addEventListener('return', function(e) {
        if (options.validate) {
            var result = options.validate();
            if (!result.result) {
                liferay.tools.alert(L('ALERT'), result.msg);
                return;
            }
        }

        var alertDialog = Titanium.UI.createAlertDialog({
            title : options.title,
            message : options.submitConfirm,
            buttonNames : [L('YES'), L('NO')]
        });
        alertDialog.addEventListener('click', function(e) {
            if (e.index == 0) {
                options.onSubmit(function() {
                    liferay.controller.getCurrentWindow().remove(formShader);
                    liferay.controller.getCurrentWindow().remove(formRound);
                });
            }
        });

        alertDialog.show();

    });

    btnCenterer.add(submitBtn);
    btnCenterer.add(closebtn);

    btnContainer.add(Ti.UI.createView({
        left: 0,
        top: 0,
        width: Ti.UI.FILL,
        height: '3dp',
        backgroundColor: '#CCCCCC'
    }));
    btnContainer.add(btnCenterer);

    formScroll.add(formContainer);
    formRound.add(formScroll);
    formRound.add(btnContainer);

    liferay.controller.getCurrentWindow().add(formShader);
    liferay.controller.getCurrentWindow().add(formRound);
};

liferay.screens.gallery.makeHeaderField = function(questionId, hintText, currentVal, top, onChange) {
    var tf = Ti.UI.createTextField({
        top: top,
        left: 0,
        width: '95%',
        height: liferay.model.iPad ? (liferay.fonts.H2Size * 1.5) : Ti.UI.SIZE,
        borderStyle: Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        font: liferay.fonts.h2,
        color: 'black',
        hintText: hintText,
        value: currentVal ? currentVal : ""
    });

    if (liferay.model.android) {
        tf.backgroundColor = 'transparent';
        tf.backgroundImage = '/images/notes.png';
    }

    if (questionId.toLowerCase().indexOf("email") != -1) {

        tf.keyboardType = Ti.UI.KEYBOARD_EMAIL;
    }
    if (onChange) {
        tf.addEventListener('change', onChange);
    }

    return tf;

};
