class Detalle {
	static detStyle = `
	<style>
		.shortcut-label {
			color:#555;
			border:1px solid #555;
			border-radius:4px;
			padding:4px;
			margin-right: 4px;
			font-size: 1em;
		}
		.table-det-block {
			margin-bottom: 1em;
			margin-top: 1em;
			font-family: 'Segoe UI', Arial, sans-serif;
		}
		.table-det-title {
			letter-spacing: 2px;
			text-align: center;
			font-weight: 600;
			font-size: 1.5em;
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
	</style>
	`;
	static sintaxisPorTipo = {
		TEXT: "':VALUE'",
		NUMBER: ":VALUE",
		DATE: "to_date(':VALUE', 'yyyy-mm-dd')",
	};

	constructor(tableId) {
		this.tableId = tableId;		
	}

	static toDetTable(tableId=undefined, configuration) {
		if(Object.keys(configuration).length == 0) return console.error("Parametro %cconfiguration vacio. Imposible convertir a tabla detalle.", "font-style:italic;color:#07C;");

		let
		tableElement = document.getElementById(tableId),
		tableParent = tableElement.parentElement,
		cellsDefinition = configuration.insertAction.cells;

		this.putTitle(tableParent, configuration.title.label, {displayShortcuts: configuration.title.displayShortcuts});
		this.putInsertButton(configuration.insertAction.location, configuration.insertAction.label, {buttonId: configuration.insertAction.id});

		this.setActionToSelector(`#${configuration.insertAction.id}`, 'click', () => {
			// Add new row to insert data.
			this.addInsertRow(tableId, cellsDefinition);
		});

	}

	static addInsertRow(tableId, cellsDefinition) {
		let
		table = document.getElementById(tableId),
		rows = table.rows,
		rowLength = rows.length,
		newRow,
		newCell,
		newElement;

		console.table(cellsDefinition);
		console.log(`
			[addInsertRow]: Parameters={tableElement: ${table.innerHTML}, cellsDefinition: ${JSON.stringify(cellsDefinition)}}
		`);

		newRow = table.querySelectorAll('tbody')[0].insertRow();

		for(let spec of cellsDefinition) {
			newCell = newRow.insertCell();

			newElement = this.createDataField(spec);

			if(newElement.dataset.indicator == "true")
				newElement.value = rowLength - 1;

			newCell.innerHTML = newElement.outerHTML;
		}

		console.log(newRow.outerHTML);
	}

	static setActionToSelector(selector, actionEvent, action) {
		document.querySelector(selector).addEventListener(actionEvent, action);
	}

	static createDataField(fieldSpecification) {
		let element = undefined;

		element = document.createElement(fieldSpecification.elementTag);
		element.type = fieldSpecification.fieldType;
		if(fieldSpecification.isIndicator)
			element.dataset.indicator = fieldSpecification.isIndicator;

		if(fieldSpecification.colname)
			element.dataset.dbcolumn = fieldSpecification.colname;

		if(fieldSpecification.cssClasses)
			fieldSpecification.cssClasses.forEach( cssClass => element.classList.add(cssClass) );

		if(fieldSpecification.elementStyle)
			fieldSpecification.elementStyle.forEach( elem => element.style[elem.prop] = elem.value );

		if(fieldSpecification.elementAttributes)
			fieldSpecification.elementAttributes.forEach( attrib => element.setAttribute(attrib.attr, attrib.value) );

		return element;
	}

	static putInsertButton(locationElement="default", buttonLabel="Agregar Item", {buttonId="pbAddItem"}) {
		if(locationElement == "default") locationElement = document.getElementById("Detail_Actions");

		let buttonComponent = `<input type="button" value="${buttonLabel}" id="${buttonId}" class="boton">`;

		locationElement.innerHTML = buttonComponent + locationElement.innerHTML;

	}

	static putTitle(locationElement=undefined, titleLabel="ITEMS", {displayShortcuts=false}) {
		if(!locationElement) return console.error("Parametro %clocationElement no definido!", "font-style:italic;color:#07C;");

		let titleComponent = `${this.detStyle}
			<div class="table-det-block" id="Detail_Title">
				<div style="display:inline-block" id="Detail_Actions"></div>
				<div class="table-det-title"> ${titleLabel} </div>
				<div ${displayShortcuts ? "style='display:inline-block'" : "style='display:none'"}>
					<b class="shortcut-label"> F3 </b><span> Agregar &nbsp; </span>
					<b class="shortcut-label"> F4 </b><span> Grabar  &nbsp; </span>
					<b class="shortcut-label"> F6 </b><span> Actualizar &nbsp; </span>
					<b class="shortcut-label"> F10 </b><span> Eliminar </span>
				</div>
			</div>`;

		locationElement.innerHTML = titleComponent + locationElement.innerHTML;
	}


}
