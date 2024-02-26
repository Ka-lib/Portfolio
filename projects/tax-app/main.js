// income box
let incomeBox = document.getElementById("income-box");
// total boxes
let regBox = document.getElementById("reg-box");
let selfEmpBox = document.getElementById("self-emp-box");
let fedBox = document.getElementById("fed-box");
let fed90Box = document.getElementById("fed-90%-box");
let stateBox = document.getElementById("state-box");
let state90Box = document.getElementById("state-90%-box");
// paid so far boxes
let paidFedBox = document.getElementById("paid-fed-box");
let paidStateBox = document.getElementById("paid-state-box");
// remainder boxes
let remainderFedBox = document.getElementById("remainder-fed-box");
let remainderFed90Box = document.getElementById("remainder-fed-90%-box");
let remainderStateBox = document.getElementById("remainder-state-box");
let remainderState90Box = document.getElementById("remainder-state-90%-box");

// input filters
setInputFilter(incomeBox, function (value) {
	return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp.
});
setInputFilter(paidFedBox, function (value) {
	return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp.
});
setInputFilter(paidStateBox, function (value) {
	return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp.
});

// currency formatter
const currencyFormater = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

// If Income box edited...
incomeBox.addEventListener("input", function (event) {
	let income = incomeBox.value;
	let fedValues = calcFedEstTax(income);
	let stateValues = calcOregonEstTax(income);

	regBox.value = currencyFormater.format(fedValues[3]);
	selfEmpBox.value = currencyFormater.format(fedValues[4]);
	fedBox.value = currencyFormater.format(fedValues[0]);
	fed90Box.value = currencyFormater.format(fedValues[1]);

	stateBox.value = currencyFormater.format(stateValues[0]);
	state90Box.value = currencyFormater.format(stateValues[1]);

	paidFedBoxEdited();
	paidStateBoxEdited();
});

// If Paid Boxes edited...
paidFedBox.addEventListener("input", function (event) {
	paidFedBoxEdited();
});

paidStateBox.addEventListener("input", function (event) {
	paidStateBoxEdited();
});

// LISTENER FUNCS!!!
function paidFedBoxEdited() {
	let fedValues = calcFedEstTax(incomeBox.value);
	// get ES Tax paid so far this year
	let paidFed = paidFedBox.value;

	remainderFedBox.value = currencyFormater.format(fedValues[0] - paidFed);
	remainderFed90Box.value = currencyFormater.format(fedValues[1] - paidFed);
}

function paidStateBoxEdited() {
	let stateValues = calcOregonEstTax(incomeBox.value);
	// get ES Tax paid so far this year
	let paidState = paidStateBox.value;

	remainderStateBox.value = currencyFormater.format(
		stateValues[0] - paidState,
	);
	remainderState90Box.value = currencyFormater.format(
		stateValues[1] - paidState,
	);
}

function calcFedEstTax(income) {
	// self employed part
	let adjIncome = income * 0.9235;
	let selfEmpTax = adjIncome * 0.029;

	// see if person maxed out
	let socialSecMaxIncome = 142800;
	if (adjIncome < socialSecMaxIncome) {
		adjIncome = adjIncome;
	} else {
		adjIncome = socialSecMaxIncome;
	}

	let socSecTax = adjIncome * 0.124;

	selfEmpTax = selfEmpTax + socSecTax;

	let toSubtractLater = selfEmpTax * 0.5;

	// 2021 Federal tax rate calc
	let regTax = 0;
	let adjGrossIncome = income - toSubtractLater;
	if (adjGrossIncome <= 9950) {
		regTax = adjGrossIncome * 0.01;
	} else if (adjGrossIncome <= 40525) {
		regTax = (adjGrossIncome - 9950) * 0.12 + 995;
	} else if (adjGrossIncome <= 86375) {
		regTax = (adjGrossIncome - 40525) * 0.22 + 4664;
	} else if (adjGrossIncome <= 164925) {
		regTax = (adjGrossIncome - 86375) * 0.24 + 14751;
	} else if (adjGrossIncome <= 209425) {
		regTax = (adjGrossIncome - 164925) * 0.32 + 33603;
	} else if (adjGrossIncome <= 523600) {
		regTax = (adjGrossIncome - 209425) * 0.35 + 47843;
	} else if (adjGrossIncome > 523600) {
		regTax = (adjGrossIncome - 523600) * 0.37 + 157804.25;
	}

	// Total Estimated Tax
	let fedTax = selfEmpTax + regTax;
	// pay 90% to avoid penalty
	let fedTaxMin = fedTax * 0.9;

	fedTax = fedTax.toFixed(2);
	fedTaxMin = fedTaxMin.toFixed(2);
	regTax = regTax.toFixed(2);
	selfEmpTax = selfEmpTax.toFixed(2);

	return [fedTax, fedTaxMin, adjGrossIncome, regTax, selfEmpTax];
}

function calcOregonEstTax(income) {
	let temp = calcFedEstTax(income);
	let fedTax = temp[0];
	let fedTaxMin = temp[1];
	let adjGrossIncome = temp[2];

	// Oregon State Tax
	let oregonTax = 0;
	let OregonTaxableIncome = adjGrossIncome - fedTax;

	// oregon tax Chart S (single)
	if (OregonTaxableIncome <= 3650) {
		oregonTax = OregonTaxableIncome * 0.0475;
	} else if (OregonTaxableIncome <= 9200) {
		oregonTax = (OregonTaxableIncome - 3650) * 0.0675 + 173;
	} else if (OregonTaxableIncome <= 125000) {
		oregonTax = (OregonTaxableIncome - 9200) * 0.0875 + 548;
	} else if (OregonTaxableIncome > 125000) {
		oregonTax = (OregonTaxableIncome - 125000) * 0.099 + 10681;
	}
	// Oregon tax minus exemptions (amount of ppl you responsible for)
	oregonTax = oregonTax - 213 * 1;
	// zero out negative values
	if (oregonTax < 0) {
		oregonTax = 0;
	}

	oregonTax = oregonTax.toFixed(2);
	let oregonTaxMin = (oregonTax * 0.9).toFixed(2);

	return [oregonTax, oregonTaxMin];
}

//STOLEN FROM STACK OVERFLOW
// https://stackoverflow.com/questions/469357/html-text-input-allow-only-numeric-input

/* I did this because html is silly so I can't make number input's 
default size any smaller which is REALLY annoying. However I can
make text input default size=1(the smallest). So this is to turn
text input into num input essentially -_- */

// Restricts input for the given textbox to the given inputFilter function.
function setInputFilter(textbox, inputFilter, errMsg) {
	[
		"input",
		"keydown",
		"keyup",
		"mousedown",
		"mouseup",
		"select",
		"contextmenu",
		"drop",
		"focusout",
	].forEach(function (event) {
		textbox.addEventListener(event, function (e) {
			if (inputFilter(this.value)) {
				// Accepted value.
				if (["keydown", "mousedown", "focusout"].indexOf(e.type) >= 0) {
					this.classList.remove("input-error");
					this.setCustomValidity("");
				}

				this.oldValue = this.value;
				this.oldSelectionStart = this.selectionStart;
				this.oldSelectionEnd = this.selectionEnd;
			} else if (this.hasOwnProperty("oldValue")) {
				// Rejected value: restore the previous one.
				this.classList.add("input-error");
				this.setCustomValidity(errMsg);
				this.reportValidity();
				this.value = this.oldValue;
				this.setSelectionRange(
					this.oldSelectionStart,
					this.oldSelectionEnd,
				);
			} else {
				// Rejected value: nothing to restore.
				this.value = "";
			}
		});
	});
}
