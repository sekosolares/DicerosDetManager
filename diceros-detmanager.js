class Detalle {
	static detStyle = `
	<style>
		.shortcut-label {
			color:#555;
			border:1px solid #555;
			border-radius:4px;
			padding:4px;
			margin-right: 4px;
			font-size: 0.7em;
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
		tableParent = tableElement.parentElement;

		this.putTitle(tableParent, configuration.title.label, {displayShortcuts: configuration.title.displayShortcuts});
		this.putInsertButton(configuration.insertAction.location, configuration.insertAction.label, configuration.insertAction.id);
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
