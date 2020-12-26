var uiController = (function () {

    DomStrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        addBtn: ".add__btn",
        incomeList: ".income__list",
        expenseList: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        containerDiv: ".container",
        expensePercentageLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    }

    var format = function (number, type) {
        number = '' + number;
        var x = number.split("").reverse().join("");

        var y = "";
        var count = 1;

        for (var i = 0; i < x.length; i++) {
            y = y + x[i];
            if (count % 3 === 0) y = y + ",";
            count++;
        }

        y = y.split("").reverse().join("");
        if (y[0] === ',') y = y.substr(1, y.length - 1);

        if (type === "inc") y = '+ ' + y;
        else if (y[0] !== "-") y = '- ' + y;

        return y;
    }

    return {
        displayDate: function () {
            var today = new Date()
            document.querySelector(DomStrings.dateLabel).textContent = today.getFullYear() + "." + today.getMonth() + "." + today.getDay()
        },
        changeType: function () {
            // var fields = document.querySelectorAll(DomStrings.inputType + ',' + DomStrings.inputDescription + ',' + DomStrings.inputValue)

            // nodeListForEach(fields, function (el) {
            //     el.classList.toggle("red-focus")
            // })

            // var btn = document.querySelector(DomStrings.addBtn).classList.toggle("red")
        },
        getInput: function () {
            return {
                type: document.querySelector(DomStrings.inputType).value,
                description: document.querySelector(DomStrings.inputDescription).value,
                value: parseInt(document.querySelector(DomStrings.inputValue).value)

            }
        },
        displayPercentages: function (allPercentages) {
            var elements = document.querySelectorAll(DomStrings.expensePercentageLabel);
            nodeListForEach(elements, function (el, index) {
                el.textContent = allPercentages[index] + "%"
            })
        },
        getDomString: function () {
            return DomStrings;
        },
        clearFields: function () {
            var fields = document.querySelectorAll(DomStrings.inputDescription + ", " + DomStrings.inputValue);

            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (el, index, arrat) {
                el.value = "";
            });

            fieldsArr[0].focus()

            // for (var i = 0; i < fieldsArr.length; i++) {
            //     fieldsArr[i].value = "";
            // }
        },
        viewBudget: function (budget) {
            var type;
            if (budget.budgets > 0) type = "inc";
            else type = "exp"
            document.querySelector(DomStrings.budgetLabel).textContent = format(budget.budgets, type)
            document.querySelector(DomStrings.incomeLabel).textContent = format(budget.totalInc, "inc")
            document.querySelector(DomStrings.expenseLabel).textContent = format(budget.totalExp, "exp")
            document.querySelector(DomStrings.percentageLabel).textContent = budget.percentage + '%'
        },
        deleteListItem: function (id) {
            var el = document.getElementById(id)
            el.parentNode.removeChild(el)
        },
        addListItem: function (item, type) {
            var html, list

            if (type === "inc") {
                list = DomStrings.incomeList
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else {
                list = DomStrings.expenseList
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            html = html.replace('%id%', item.id)
            html = html.replace('%description%', item.desc)
            html = html.replace('%value%', format(item.val, type))

            document.querySelector(list).insertAdjacentHTML("beforeend", html)
        }
    }
})();

var financeController = (function () {

    var Income = function (id, desc, val) {
        this.id = id;
        this.desc = desc;
        this.val = val;
    }

    var Expense = function (id, desc, val) {
        this.id = id;
        this.desc = desc;
        this.val = val;
        this.percentage = -1;
    }

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0)
            this.percentage = Math.round((this.val / totalIncome) * 100);
        else this.percentage = 0;
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.items[type].forEach(function (el) {
            sum = sum + el.val
        })

        data.totals[type] = sum;
    }

    var data = {
        items: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: 0
    }

    return {
        calculateBudget: function () {
            calculateTotal("inc")
            calculateTotal("exp")

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else data.percentage = 0;
        },
        calculatePercentages: function () {
            data.items.exp.forEach(function (el) {
                el.calcPercentage(data.totals.inc)
            })
        },
        getPercentages: function () {
            var allPercentages = data.items.exp.map(function (el) {
                return el.getPercentage()
            })
            return allPercentages
        },
        getBudget: function () {
            return {
                budgets: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },
        deleteItem: function (type, id) {
            var ids = data.items[type].map(function (el) {
                return el.id
            })

            var index = ids.indexOf(id)
            if (index !== -1) {
                data.items[type].splice(index, 1)
            }

        },
        addItem: function (type, desc, val) {
            var item, id;

            if (data.items[type].length === 0) {
                id = 1;
            } else {
                id = data.items[type][data.items[type].length - 1].id + 1;
            }

            if (type === "inc") {
                item = new Income(id, desc, val);
            } else {
                item = new Expense(id, desc, val);
            }

            data.items[type].push(item);
            return item;
        },
        data: function () {
            return data
        }
    }
})();

var appController = (function (uiController, financeController) {


    var ctrlAddItem = function () {
        var input = uiController.getInput();

        if (input.description !== "" && input.value !== "") {
            var item = financeController.addItem(input.type, input.description, input.value);
            uiController.addListItem(item, input.type);
            uiController.clearFields();

            updateBudget()
        }

    }

    var updateBudget = function () {
        financeController.calculateBudget();
        var budget = financeController.getBudget();

        uiController.viewBudget(budget)

        financeController.calculatePercentages()
        var allPercentages = financeController.getPercentages()

        uiController.displayPercentages(allPercentages)

    }


    var setupEvenListener = function () {
        var Dom = uiController.getDomString();

        document.querySelector(Dom.inputType).addEventListener("change", uiController.changeType)

        document.querySelector(Dom.addBtn).addEventListener("click", function () {
            ctrlAddItem();
        });

        document.addEventListener("keypress", function (event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        })

        document.querySelector(Dom.containerDiv).addEventListener('click', function (event) {
            var id = event.target.parentNode.parentNode.parentNode.parentNode.id

            if (id) {
                var arr = id.split('-')
                var type = arr[0]
                var itemId = parseInt(arr[1])

                financeController.deleteItem(type, itemId)
                uiController.deleteListItem(id)

                updateBudget()
            }
        })
    }

    return {
        init: function () {
            uiController.displayDate()
            uiController.viewBudget({
                budgets: 0,
                percentage: 0,
                totalInc: 0,
                totalExp: 0
            })
            setupEvenListener();
        }
    }

})(uiController, financeController);

appController.init();