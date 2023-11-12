function openNumericKeyboard(inputElement) {
    inputElement.setAttribute("type", "tel");
}


var timeoutId;
const inputMoneda = document.querySelector("#monto");
const inputCuotas = document.querySelector("#cuotas");
const inputInteres = document.querySelector("#interes");

const numberFormat = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});



inputMoneda.addEventListener("keyup", (event) => {
    const letter = event.target.value[event.target.selectionStart - 1];

    // // Validar la letra
    if (letter == "," || letter == ".") {
        inputMoneda.value = "";
    } else {
        const unformattedValue = event.target.value.replaceAll(".", "").replaceAll(",", "");
        if (isValidNumber(unformattedValue)) {
            var value = new Intl.NumberFormat("es-CO").format(parseFloat(unformattedValue));
            console.log(value);
            inputMoneda.value = value;
        } else {
            inputMoneda.value = "";
        }
    }
});

inputCuotas.addEventListener("keyup", (event) => {
    const letter = event.target.value[event.target.selectionStart - 1];

    // // Validar la letra
    if (letter == "," || letter == ".") {
        inputCuotas.value = "";
    } else {
        const unformattedValue = event.target.value.replaceAll(".", "").replaceAll(",", "");
        if (isValidNumber(unformattedValue)) {
            if (parseInt(event.target.value.replaceAll(".", "").replaceAll(",", "")) > 48) {
                inputCuotas.value = "48";
            }
        } else {
            inputCuotas.value = "";
        }
    }
});

inputInteres.addEventListener("keyup", (event) => {
    const letter = event.target.value[event.target.selectionStart - 1];

    // // Validar la letra
    if (letter == ",") {
        inputInteres.value = "";
    } else {
        const unformattedValue = event.target.value.replaceAll(".", "");
        if (isValidFloat(unformattedValue)) {
            if (parseFloat(event.target.value.replaceAll(",", "")) > 100) {
                inputInteres.value = "100";
            }
        } else {
            inputInteres.value = "";
        }
    }
});

function isValidNumber(value) {
    return /^[0-9]+$/.test(value);
}

function isValidFloat(value) {
    return /^-?\d*(\.\d+)?$/.test(value);
}

document.getElementById("form_calculate").addEventListener("submit", function (event) {
    // Evitar que el formulario se envíe de forma predeterminada
    event.preventDefault();

    var resultadosTbody = document.getElementById("resultados");

    var monto = parseInt(document.getElementById("monto").value.replaceAll(".", "").replaceAll(",", ""));
    var cuotas = parseInt(document.getElementById("cuotas").value);
    var interes = parseFloat(document.getElementById("interes").value);

    //Calculo Actual
    localStorage.setItem("calcActual", JSON.stringify({}));
    var calcActual = JSON.parse(localStorage.getItem("calcActual"));
    calcActual = {};
    calcActual["NumCuotas"] = cuotas;
    calcActual["Monto"] = monto;
    calcActual["Interes"] = interes;
    localStorage.setItem("calcActual", JSON.stringify(calcActual));

    //abono actual
    localStorage.setItem("abonosAct", JSON.stringify({}));
    var abonoAct = JSON.parse(localStorage.getItem("abonoAct"));
    localStorage.setItem("abonoAct", JSON.stringify(abonoAct));


    var Cuotas = [];
    var valorAct = monto;
    var numCuotasAux = cuotas;

    for (let index = 0; index < cuotas; index++) {
        var neto = valorAct / numCuotasAux;
        var interesAct = ((valorAct * interes) / 100);
        var total = neto + interesAct;
        var restante = valorAct - neto;
        var cuota = {
            "#": index,
            "neto": neto,
            "interes": interesAct,
            "total": total,
            "restante": restante,
            "previousDebt": 0,
            "isQuotaModified": 0,
            "quotaModified": 0
        }

        valorAct -= neto;
        numCuotasAux--;
        Cuotas.push(cuota);
    }

    calcActual["cuotas"] = Cuotas;
    localStorage.setItem("calcActual", JSON.stringify(calcActual));

    if (calcActual && calcActual.cuotas) {
        resultadosTbody.innerHTML = "";
        var totalinteres = 0;
        calcActual.cuotas.forEach(function (cuota) {
            var nuevaFila = document.createElement("tr");
            nuevaFila.innerHTML = `<td>${(cuota["#"]) + 1}</td>
                                  <td   >$${formatThisResult(cuota.neto)}</td>
                                  <td style="color:red;" >$${formatThisResult(cuota.interes)}</td>
                                  <td  >$${formatThisResult(cuota.total)}</td>
                                  <td  >$${formatThisResult(cuota.quotaModified)}</td>
                                  <td style="color:green; font-weight: bold;" >$${formatThisResult(cuota.restante)}</td>`;
            resultadosTbody.appendChild(nuevaFila);
            totalinteres += cuota.interes;
        });

        var nuevaFila = document.createElement("tr");
        nuevaFila.innerHTML = `<td colspan="5" style="font-weight: 500;" >Total interes pagado: <span style="color:red;" >$${formatThisResult(totalinteres)} </span> </td>`;
        resultadosTbody.appendChild(nuevaFila);
    }

    var btnAbonar = document.getElementById('btn-abonar');
    var btnIgualar = document.getElementById('btn-acomodar');
    var selectCuotas = document.getElementById('cuotasSelect');


    // Cambiar el estilo
    if (btnAbonar) {
        btnAbonar.style.display = 'block';
        selectCuotas.innerHTML = "";

        btnAbonar.removeEventListener("keyup", validarClickBtnAbono);
        btnAbonar.addEventListener('click', function () {
            validarClickBtnAbono(calcActual, selectCuotas);
        });
    }

    if (btnIgualar) {
        btnIgualar.style.display = 'block';
    }

    localStorage.setItem("contentIndexQuotes", JSON.stringify([]));
    console.log(localStorage.getItem("contentIndexQuotes"));
});

document.getElementById("form_abonar").addEventListener("submit", function (event) {
    event.preventDefault();

    var inputAbono = document.getElementById('abono');
    var selectCuotas = document.getElementById('cuotasSelect');
    var Abono = parseFloat(document.getElementById("abono").value.replaceAll(",", ""));
    var maxAbono = parseFloat(JSON.parse(localStorage.getItem("maxAbono")));
    var minAbono = parseFloat(JSON.parse(localStorage.getItem("minAbono")));
    var cuota = parseInt(document.getElementById("cuotasSelect").value);
    var calcActual = JSON.parse(localStorage.getItem("calcActual"));
    var contentIndexQuotes = JSON.parse(localStorage.getItem("contentIndexQuotes"));

    if (!contentIndexQuotes) {
        contentIndexQuotes = [];
        localStorage.setItem("contentIndexQuotes", JSON.stringify(contentIndexQuotes));
    }
    // console.log(contentIndexQuotes)
    // Obtener el número mayor
    // var validacion = true;

    // var numeroMayor = 0;
    // if (contentIndexQuotes.length > 0) {
    //     numeroMayor = Math.max(...contentIndexQuotes);

    // }
    // console.log((cuota ) , calcActual['cuotas'].length)

    if (  (cuota) < calcActual['cuotas'].length) {
        if (Abono > maxAbono) {
            alert("El abono no puede ser mayor a ", maxAbono)
        } else if (Abono < minAbono) {
            alert("El abono no puede ser menor a ", minAbono)
        } else {


            cuota -= 1;

            var resultadosTbody = document.getElementById("resultados");

            //asignar nuevos valores
            contentIndexQuotes.push(cuota)
            localStorage.setItem("contentIndexQuotes", JSON.stringify(contentIndexQuotes));
            calcActual['cuotas'][cuota]['isQuotaModified'] = 1;
            calcActual['cuotas'][cuota]['quotaModified'] = Abono;

            var interes = calcActual["Interes"];
            var valorAct = calcActual["Monto"];
            var numCuotasAux = calcActual["NumCuotas"];
            var previousDebt = calcActual['cuotas'][cuota]['previousDebt'];
            newarray = [];
            calcActual['cuotas'].forEach((element, index) => {
                var neto = (valorAct / numCuotasAux) + previousDebt;
                var interesAct = ((valorAct * interes) / 100);
                var total = neto + interesAct;
                var restante = element.isQuotaModified == 0 ? valorAct - neto : valorAct - (((element.quotaModified) - element.interes) + previousDebt);
                var cuota = {
                    "#": index,
                    "neto": neto,
                    "interes": interesAct,
                    "total": total,
                    "previousDebt": 0,
                    "restante": restante,
                    "isQuotaModified": element.isQuotaModified,
                    "quotaModified": element.quotaModified
                }

                valorAct -= element.isQuotaModified == 0 ? neto : ((element.quotaModified) - element.interes);
                numCuotasAux--;

                if (element.isQuotaModified == 1 && !(calcActual['cuotas'].length == (index + 1)) && ((valorAct / numCuotasAux) < element.quotaModified)) {
                    calcActual['cuotas'][index + 1][previousDebt] = ((valorAct / numCuotasAux) - element.quotaModified);
                }
                newarray.push(cuota)
            });

            //asginar nuevas cuotas
            calcActual["cuotas"] = {};
            calcActual["cuotas"] = newarray;
            localStorage.setItem("calcActual", JSON.stringify(calcActual));

            if (calcActual && calcActual.cuotas) {
                resultadosTbody.innerHTML = "";
                var totalinteres = 0;
                calcActual.cuotas.forEach(function (cuota) {
                    var nuevaFila = document.createElement("tr");
                    nuevaFila.innerHTML = `<td>${(cuota["#"]) + 1}</td>
                                  <td   >$${formatThisResult(cuota.neto)}</td>
                                  <td style="color:red;" >$${formatThisResult(cuota.interes)}</td>
                                  <td  >$${formatThisResult(cuota.total)}</td>
                                  <td  >$${formatThisResult(cuota.quotaModified)}</td>
                                  <td style="color:green; font-weight: bold;" >$${formatThisResult(cuota.restante)}</td>`;
                    resultadosTbody.appendChild(nuevaFila);
                    totalinteres += cuota.interes;
                });

                var nuevaFila = document.createElement("tr");
                nuevaFila.innerHTML = `<td colspan="5" style="font-weight: 500;" >Total interes pagado: <span style="color:red;" >$${formatThisResult(totalinteres)} </span> </td>`;
                resultadosTbody.appendChild(nuevaFila);
            }

            var validacion = (calcActual['cuotas'][cuota]['restante']) != 0;
            var max = validacion ? JSON.stringify((calcActual['cuotas'][cuota]['total'] + calcActual['cuotas'][cuota]['restante'])) : JSON.stringify((calcActual['cuotas'][cuota]['total']))
            var min = JSON.stringify((calcActual['cuotas'][cuota]['interes']))
            if (calcActual['cuotas'].length == ((cuota) + 1)) {
                min = max
            }

            localStorage.setItem("maxAbono", max);
            localStorage.setItem("minAbono", min);

            inputAbono.value = min;
            selectCuotas.selectedIndex = cuota;

            inputAbono.removeEventListener("keyup", validarInputAbono);
            inputAbono.addEventListener("keyup", function (event2) {
                validarInputAbono(event2, 0);
            });


            var myModal = new bootstrap.Modal(document.getElementById('myModal'));
            myModal.hide();
        }
    } else {
        alert("ya hay una cuota modificada despues de esta, o es la ultima cuota")
    }
});

function formatThisResult(value) {
    return value.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function validarInputAbono(event) {
    var inputAbono = document.getElementById('abono');
    var submitAbonar = document.getElementById('submit_abonar');
    submitAbonar.display = 'none';
    const letter = event.target.value[event.target.selectionStart - 1];

    // // Validar la letra
    if (letter == "," || letter == ".") {
        inputAbono.value = "";
    } else {
        const unformattedValue = event.target.value.replaceAll(".", "");


        if (isValidFloat(unformattedValue)) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                var valorIngresado = parseFloat(event.target.value.replaceAll(",", ""));

                if (valorIngresado > parseFloat(JSON.parse(localStorage.getItem("maxAbono")))) {
                    inputAbono.value = parseFloat(JSON.parse(localStorage.getItem("maxAbono")));
                } else if (valorIngresado < parseFloat(JSON.parse(localStorage.getItem("minAbono")))) {
                    inputAbono.value = parseFloat(JSON.parse(localStorage.getItem("minAbono")));
                }
            }, 1500)
        } else {
            inputAbono.value = "";
        }
    }
}

function validarClickBtnAbono(calcActual, selectCuotas) {

    var inputAbono = document.getElementById('abono');

    var validacion = (calcActual['cuotas'][0]['restante']) != 0;
    var max = validacion ? JSON.stringify((calcActual['cuotas'][0]['total'] + calcActual['cuotas'][0]['restante'])) : JSON.stringify((calcActual['cuotas'][0]['total']))
    var min = JSON.stringify((calcActual['cuotas'][0]['interes']))
    // console.log(calcActual['cuotas'][0])
    // var min = (calcActual['cuotas'][0]['interes'])
    // if (calcActual['cuotas'].length == ((valorSeleccionado) + 1)) {
    //     min = max
    // }
    localStorage.setItem("maxAbono", max);
    localStorage.setItem("minAbono", min);

    var maxAbono = JSON.parse(localStorage.getItem("maxAbono"));
    var minAbono = JSON.parse(localStorage.getItem("minAbono"));

    for (var i = 1; i <= calcActual["NumCuotas"]; i++) {
        const option = document.createElement("option")
        if (i === 1) { option.selected = true };
        option.value = i
        option.innerHTML = i
        selectCuotas.appendChild(option)
    }

    // Mostrar el modal
    var myModal = new bootstrap.Modal(document.getElementById('myModal'));
    myModal.show();

    inputAbono.value = minAbono;

    inputAbono.removeEventListener("keyup", validarInputAbono);
    inputAbono.addEventListener("keyup", function (event2) {
        validarInputAbono(event2, maxAbono);
    });


    selectCuotas.addEventListener('change', function () {
        var valorSeleccionado = selectCuotas.value;
        valorSeleccionado -= 1;

        var validacion = (calcActual['cuotas'][valorSeleccionado]['restante']) != 0;
        var max = validacion ? (calcActual['cuotas'][valorSeleccionado]['total'] + calcActual['cuotas'][valorSeleccionado]['restante']) : (calcActual['cuotas'][0]['total'])

        var min = (calcActual['cuotas'][valorSeleccionado]['interes'])
        if (calcActual['cuotas'].length == ((valorSeleccionado) + 1)) {
            min = max
        }
        localStorage.setItem("maxAbono", max);
        localStorage.setItem("minAbono", min);

        inputAbono.removeEventListener("keyup", validarInputAbono);
        inputAbono.addEventListener("keyup", function (event2) {
            validarInputAbono(event2, maxAbono);
        });

        inputAbono.value = min;

    });

}

const btnIgualar = document.getElementById('btn-acomodar');

btnIgualar.removeEventListener("keyup", validarClickBtnAbono);
btnIgualar.addEventListener('click', function () {
    validarClickBtnAcomodar();
});

function validarClickBtnAcomodar() {

    var calcActual = JSON.parse(localStorage.getItem("calcActual"));
    var cuotas = calcActual['cuotas'];

    var sumTotal = 0;
    cuotas.forEach(element => {
        sumTotal += element.total;
    });

    // console.log()

    var generalQuote = sumTotal / cuotas.length;

    var interes = calcActual["interes"];
    var valorAct = calcActual["Monto"];
    var numCuotasAux = calcActual["NumCuotas"];
    newarray = [];
    calcActual['cuotas'].forEach((element, index) => {
        var neto = generalQuote;
        var interesAct = ((valorAct * interes) / 100);
        var total = neto + interesAct;
        var restante = element.isQuotaModified == 0 ? valorAct - neto : valorAct - ((element.quotaModified) - element.interes);
        var cuota = {
            "#": index,
            "neto": neto,
            "interes": interesAct,
            "total": total,
            "restante": restante,
            "isQuotaModified": element.isQuotaModified,
            "quotaModified": element.quotaModified
        }

        valorAct -= element.isQuotaModified == 0 ? neto : ((element.quotaModified) - element.interes);
        numCuotasAux--;
        newarray.push(cuota)
    });

    //asginar nuevas cuotas
    calcActual["cuotas"] = {};
    calcActual["cuotas"] = newarray;
    localStorage.setItem("calcActual", JSON.stringify(calcActual));

}