class Detalle {
  tableID;
  tableParent;
  cells_quantity;
  config;
  sintaxisPorValor = {
    TEXT: "':VALUE'",
    NUMBER: ":VALUE",
    DATE: "to_date(':VALUE', 'yyyy-mm-dd')",
  };
  css = `<style>
        .shortcut-label {
                color:#555;
                border:1px solid #555;
                border-radius:4px;
                padding:4px;
        }
        .table-det-block {
                margin-bottom: 1em;
                margin-top: 1em;
        }
        .table-det-title {
                letter-spacing: 2px;
                text-align: center;
                font-family: 'Segoe UI', Arial, sans-serif;
                font-weight: 600;
                font-size: 2em;
                padding-left: 30px;
                padding-right: 30px;
                display: inline;
        }
        .boton {
        background-color: #306FAB;
        border-radius: 5px;
        border: 1px solid #306FAB;
        color: #FFFFFF;
        padding: 4px 8px;
        }
        .boton:hover {
        background-color: #0C5AA6;
        border: 1px solid #0C5AA6;
        cursor: pointer;
        color: #FFFFFF;
        padding: 4px 8px;
        }
        input.boton:focus {
        border: 1px solid #07C;
        border-radius: 2px;
        box-shadow: 3px 3px 3px #9A9A9A;
        padding: 4px 8px;
        }
</style>`;
  tableDetTitleBlock;

  constructor(detTableId, config) {
    this.tableID = detTableId;
    this.cells_quantity =
      document.getElementById(detTableId).rows[0].cells.length;
    this.config = config;
    this.config.detTableTitle = config.detTableTitle
      ? config.detTableTitle
      : "ITEMS";
    this.config.pbAddId = config.pbAddId ? config.pbAddId : "pbAddNewItem";

    this.tableDetTitleBlock = `
	<div class="table-det-block" id="AddItem_TitleBlock">
		<input type="button" value="Agregar Item" id="${this.config.pbAddId}" class="boton">
		<div class="table-det-title"> ${this.config.detTableTitle} </div>
		<b class="shortcut-label"> F3 </b><span>&nbsp; Agregar Item &nbsp; |</span>
		<b class="shortcut-label"> F4 </b><span>&nbsp; Grabar detalle &nbsp; |</span>
		<b class="shortcut-label"> F6 </b><span>&nbsp; Actualizar detalle &nbsp; |</span>
		<b class="shortcut-label"> F10 </b><span>&nbsp; Eliminar detalle</span>
	</div>`;
    this.tableParent = document.getElementById(detTableId).parentElement;
  }

  render() {
    this.tableParent.innerHTML =
      this.css + this.tableDetTitleBlock + this.tableParent.innerHTML;
  }

  hideTable(hideParent) {
    if (hideParent) return (this.tableParent.style.display = "none");
    document.getElementById(this.tableID).style.display = "none";
  }

  showTable(showParent) {
    if (showParent) return (this.tableParent.style.display = "");
    document.getElementById(this.tableID).style.display = "";
  }

  bindButtons(buttonsBinding = { addNewItem: "pbAddNewItem" }) {
    if (document.getElementById(buttonsBinding.addNewItem)) {
      let id = this.tableID,
        configuration = this.config,
        syntaxValue = this.sintaxisPorValor;
      document
        .getElementById(buttonsBinding.addNewItem)
        .addEventListener("click", function () {
          let items = document.getElementById(id),
            linea = items.querySelectorAll("tr").length - 1,
            newRow = undefined,
            newCell = undefined,
            element = undefined;
          const CELLS_QUANT = configuration.newItemCells.length;

          newRow = document.createElement("tr");
          newRow.classList.add("clTableOn");

          for (let j = 0; j < CELLS_QUANT; ++j) {
            newCell = document.createElement("td");
            newCell.classList.add("clTableOn");

            if (configuration.newItemCells[j])
              element = configuration.newItemCells[j]();

            if (element.dataset.indicator) element.value = linea;

            if (element) {
              newCell.appendChild(element);
              newRow.appendChild(newCell);
            }
          }

          newCell = document.createElement("td");
          newCell.classList.add("clTableOn");

          let save = document.createElement("input");
          save.type = "button";
          save.id = "saveReg";
          save.classList.add("boton");
          save.value = "(F4) Grabar";
          save.style.backgroundColor = "#218c4c";
          save.style.border = "1px solid #218c4c";
          save.addEventListener("click", function () {
            let columnas = configuration.dbColumns,
              valores = [],
              confirmado = true,
              params = [];

            for (let colname of columnas) {
              console.info(`[saveReg]: colname: ${colname}`);
              let field = document.querySelector(
                  "[data-dbcolumn='" + colname + "'"
                ),
                fieldType = field.getAttribute("type")
                  ? field.getAttribute("type").toUpperCase()
                  : "HIDDEN",
                valor = "";

              console.info(
                `[saveReg]: field = ${field.parentElement} | fieldType = ${fieldType}`
              );

              if (!fieldType || fieldType == "HIDDEN")
                fieldType = field.dataset.type.toUpperCase();

              console.info(
                `[saveReg]: fieldType [after validation] = ${fieldType} | syntaxValue: ${syntaxValue}`
              );

              valor = syntaxValue[fieldType].replace(/:VALUE/g, field.value);
              valores.push(valor);
            }

            params = [
              "tp=P",
              "m=I",
              "l=" + valores.join("|"),
              "c=" + columnas.join("|"),
              "t=" + configuration.dbTable,
            ];
            params = params.join("&");

            let url = document.location.href;
            url = url.substring(0, url.lastIndexOf("Sistema/") + 7);
            url += "/getdata?" + params;

            console.log(
              `[onSaveReg]: callback=${configuration.onSaveCallback}`
            );

            if (confirmado) {
              fetch(encodeURI(url)).then((response) => {
                if (response.ok) {
                  response.text().then((response) => {
                    if (response != 1) {
                      alert("Algo salio mal al grabar el detalle!");
                      console.error(
                        "Ocurrio un error al guardar detalle. Info: " + response
                      );
                    } else {
                      if (configuration.onSaveCallback)
                        configuration.onSaveCallback();
                      if (document.querySelector("a[title*='Refrescar']"))
                        document.querySelector("a[title*='Refrescar']").click();
                      else document.location.reload();
                    }
                  });
                }
              });
            }
          });

          newCell.appendChild(save);
          newRow.appendChild(newCell);

          items.querySelectorAll("tbody")[0].appendChild(newRow);
        });
    }
  }
}
