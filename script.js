function openNumericKeyboard(inputElement) {
    inputElement.setAttribute("type", "tel");
}



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
    var s = {

    }
    
    localStorage.setItem("calcActual", JSON.stringify({}));

    // Recuperar desde localStorage
    var calcActual = JSON.parse(localStorage.getItem("calcActual"));

    // Hacer las asignaciones
    calcActual["NumCuotas"] = cuotas;
    calcActual["Monto"] = monto;
    calcActual["Interes"] = interes;

    // Volver a guardar en localStorage
    localStorage.setItem("calcActual", JSON.stringify(calcActual));


    var Cuotas = [];

    var valorAct = monto;
    var numCuotasAux = cuotas;


    for (let index = 0; index < cuotas; index++) {
        // console.log("cuota " + index)
        var neto = valorAct/numCuotasAux;
        var interesAct = ((valorAct*interes)/100);
        var total = neto + interesAct;
        var restante= valorAct-neto;
        var cuota = {
            "#":index,
            "neto": neto,
            "interes": interesAct,
            "total": total,
            "restante": restante
        }

        valorAct-= neto;
        numCuotasAux--;

        Cuotas.push(cuota);
    }

    calcActual["cuotas"] = Cuotas;
    localStorage.setItem("calcActual", JSON.stringify(calcActual));


    console.log(calcActual);

    if (calcActual && calcActual.cuotas) {
        // Iterar sobre las cuotas y agregarlas a la tabla
        resultadosTbody.innerHTML="";
        calcActual.cuotas.forEach(function (cuota) {
            var nuevaFila = document.createElement("tr");
            nuevaFila.innerHTML = `<td>${(cuota["#"])+1}</td>
                                  <td   >$${formatThisResult(cuota.neto) }</td>
                                  <td style="color:red;" >$${formatThisResult(cuota.interes) }</td>
                                  <td  >$${formatThisResult(cuota.total)}</td>
                                  <td style="color:green; font-weight: bold;" >$${formatThisResult(cuota.restante)}</td>`;
            resultadosTbody.appendChild(nuevaFila);
        });
    }
});

function formatThisResult(value){
    return value.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}