$$
	^^ origin.form = function(config) {
		$$

		$scope.resetForm = function() {
			$scope.target = {};
			$("#form input").val("");
			$("#form select").val("");
		}
		$scope.resetForm();
		var submitUrl = "/api/^^=config.submit$$"; ^^
		if (config.uploadFile) {
			$$
			$scope.submitForm = function() {
				var d = $scope.target;
				var formdata = new FormData();
				$("input[type='file'").each(function(i, dom) {
					var file = $(dom)[0].files[0];
					if (file) {
						console.log(i, file);
						formdata.append($(dom).attr("name") || "file", file);
					}
				});
				for (var key in d) {
					formdata.append(key, d[key]);
				}
				$.ajax({
					type: 'POST',
					url: submitUrl,
					data: formdata,
					headers: {
						Authorization: "Bearer " + auth.gettoken()
					},
					contentType: false,
					processData: false,
					success: function(msg) {
						alert(JSON.stringify(msg));
						$scope.resetForm();
					},
					error: function(err) {
						alert(JSON.stringify(err));
						$scope.resetForm();
					}
				});
			} ^^
		} else {
			$$
			$scope.submitForm = function() {
				req.postEx(submitUrl, {
					Authorization: "Bearer " + auth.gettoken()
				}, $scope.target, function(err, data) {
					console.log(err, data);
					$scope.resetForm();
				});
			} ^^
		}
		$$
			^^
	}
$$

	^^ origin.displayJson = function(config) {
	$$
		^^
}
$$
	^^ origin.format = function(config) {
		$$

		$scope.toggle = function(model) {
			if (!model.$sub) model.$sub = {};
			model.$sub.$collapse = !model.$sub.$collapse;
		}

		^^
	}
$$
	^^ origin.table = function(config) {
		if (config.withSchema) {
			$.append(config.fields, global.proto.schemas[config.withSchema].fields);
		}
		$$

		$scope["^^=config.name$$"] = new displayTable($scope, {
			api: "^^=config.api$$"
		});
		$scope["^^=config.name$$"].refresh();
		$scope.xxx = 1;
		$scope.aaa = ["A", "ab", "cb"];
		//$scope.test.querys=[{name:"A"},{name:"B"}];
		function displayTable($scope, config) {
			if (!config.api) {
				console.error("no api");
				return
			}
			this.$scope = $scope;
			this.data = [];
			this.currPage = 1;
			this.totalPage = 0;
			this.perPage = 10; //the number of entries per page
			this.perScreen = 5; //the number of pages per screen
			this.api = config.api;
			^^if(config.query) {$$
				this.where = ^^=JSON.stringify(config.query.default) || {}$$;
			^^}$$
			console.log(this.where);
			var self = this;
			self.sort = {};
			$scope.$watch(function() {
				return self.perPage;
			}, function(oldv, newv) {
				if (oldv && oldv != newv) {
					self.currPage = 1;
					self.refresh();
				}
			});
			$scope.$watchCollection(function() {
				return self.sort;
			}, function(oldv, newv) {
				if (oldv && oldv != newv) self.refresh();
			});
			self.adj = function() {
				var b = (self.perScreen - 1) / 2;
				var arr = [];
				var mid = self.currPage;
				if (mid <= b) mid = b + 1;
				if (mid > self.totalPage - b) mid = self.totalPage - b;
				for (var i = mid - b; i <= mid + b; i++) {
					if (i <= 0) continue;
					if (i > self.totalPage) continue;
					arr.push(i);
				}
				return arr;
			};
			self.gotoPage = function(page) {
				if (page == self.currPage) return;
				self.currPage = page;
				self.refresh();
			};
			self.gotoFirst = function() {
				self.gotoPage(1);
			}
			self.gotoLast = function() {
				self.gotoPage(self.totalPage);
			}
			self.changeSort = function(key, value) {
				var json = {};
				json[key] = value || -self.sort[key] || -1;
				self.sort = json;
			}
			self.refresh = $scope.refresh = function() {
				req.postEx("/api/" + self.api, {
					Authorization: "Bearer " + auth.gettoken()
				}, {
					where: self.where || {},
					op: {
						$sort: self.sort,
						$skip: (self.currPage - 1) * self.perPage,
						$limit: self.perPage
					}
				}, function(err, data) {
					console.log(data);
					self.data = data.data;
					self.count = data.count;
					self.totalPage = Math.ceil(data.count / self.perPage);
				});
			}
		}
		$scope.$on('onRepeatLast', function(scope, element, attrs) {
			$("[data-toggle='popover']").popover({
				"delay": {
					show: 300,
					hide: 100
				},
				"title": "",
				"trigger": "hover",
				"html": true,
				"container": 'body'
			});

			function setContent($dom, html) {
				$dom.attr("data-content", html);
			}
			$("[data-toggle='popover']").mouseover(function(e, d) {
				var userid = $(this).attr("userid");
				var $this = $(this);
				req.get('/api/getSimpleAccount/' + userid, function(err, user) {
					if (err) {
						console.log(err);
						setContent($this, "<div class=\"text-warning\">系统出现错误！</div>");
						return;
					}
					if (!user) {
						setContent($this, "<div class=\"text-warning\">没有用户信息！</div>");
						return;
					}
					var table = "<table class=\"text-success\">"
					for (var key in user) {
						table += "<tr class=\"row\"><td class=\"text-right col-sm-6\">" + key + "</td><td class=\"text-left col-sm-6\">" + user[key] + "</td></tr>"
					}
					table += "</table>"
					setContent($this, table);
				});
			});
		});
		//opt
		^^
		if (config.opt && config.withSchema) {
			var methods = {};
			// var addApi = config.opt.add.type || config.opt.add.api;
			// var updateApi = config.opt.update.api || "modify"+config.withSchema;
			// var deleteApi = config.opt.delete.api || "delete"+config.withSchema;
			// [addApi,updateApi,deleteApi].forEach(function(i,api){
			// 	methods[api] = global.proto.apis[api];
			// });
			$$

			function resetOpt() {
				$scope.opt_model = {};
			}

			function setDataToOptform(row) {
				$scope.opt_model = row;
			}

			function toggleOptmodal() {
				$("#optModal").modal('toggle');
			}
			^^if(config.opt.add){$$
			$scope.optAdd = function() {
				resetOpt();
				toggleOptmodal();
				$scope.optUrl = "^^=config.opt.add.api$$" || "add^^=config.withSchema$$";
			}
			^^}$$
			^^if(config.opt.update){$$
			$scope.optUpdate = function(row) {
				if (!row._id) return alert("no _id field!");
				setDataToOptform(row);
				toggleOptmodal();
				$scope.optUrl = "^^=config.opt.update.api$$" || "modify^^=config.withSchema$$";
			}
			^^}$$
			^^if(config.opt.delete){$$
			$scope.optDelete = function(row) {
				if (!row._id) return alert("no _id field!");
				$scope.optUrl = "^^=config.opt.delete.api$$" || "delete^^=config.withSchema$$";
				if (confirm("确认删除记录：" + row._id)) {
					req.postEx("/api/" + $scope.optUrl, {
						Authorization: "Bearer " + auth.gettoken()
					}, {
						"_id": row._id
					}, function(err, result) {
						if (err) return alert(JSON.stringify(err));
						alert(JSON.stringify(result));
						$scope["^^=config.name$$"].refresh();
					});
				}
			}
			^^}$$
			$scope.resetOptform = function() {
				console.log("reset: ", $scope.opt_model);
				resetOpt();
			}
			$scope.submitOptform = function() { ^^
				var hasFile = false;
				for (var field in config.fields) {
					if (config.fields[field].type == "file") hasFile = true;
				}
				if (hasFile) {
					$$
					console.log(($scope.opt_model._id ? "update " : "add "), $scope.opt_model);
					var d = $scope.opt_model;
					var formdata = new FormData();
					for (var key in d) {
						formdata.append(key, d[key]);
					}
					$("#optform input[type='file'").each(function(i, dom) {
						var file = $(dom)[0].files[0];
						if (file) {
							console.log(i, file);
							formdata.append($(dom).attr("name") || "file", file);
						}
					});
					$.ajax({
						type: 'POST',
						url: "/api/" + $scope.optUrl,
						data: formdata,
						headers: {
							Authorization: "Bearer " + auth.gettoken()
						},
						contentType: false,
						processData: false,
						success: function(msg) {
							alert(JSON.stringify(msg));
							$scope.closeOptform();
							$scope["^^=config.name$$"].refresh();
						},
						error: function(err) {
							alert(JSON.stringify(err));
						}
					}); ^^
				} else {
					$$
					req.postEx("/api/" + $scope.optUrl, {
						Authorization: "Bearer " + auth.gettoken()
					}, $scope.opt_model, function(err, result) {
						if (err) return alert(JSON.stringify(err));
						alert(JSON.stringify(result));
						$scope.closeOptform();
						$scope["^^=config.name$$"].refresh();
					}); ^^
				}
				$$
			}
			$scope.closeOptform = function() {
				resetOpt();
				toggleOptmodal();
				console.log("closeOptform");
			} ^^
		}
		$$
			^^
	}
$$