class Detalle {
      static detStyle = `
	<style>
		.detmanager-shortcut-label {
			color:#555;
			border:1px solid #555;
			border-radius:4px;
			padding:4px;
			margin-right: 4px;
			font-size: 1em;
		}
		.detmanager-table-det-block {
			margin-bottom: 1em;
			margin-top: 1em;
			font-family: 'Segoe UI', Arial, sans-serif;
		}
		.detmanager-table-det-title {
			letter-spacing: 2px;
			text-align: center;
			font-weight: 600;
			font-size: 1.5em;
			padding-left: 30px;
			padding-right: 30px;
			display: inline;
		}
		.detmanager-boton {
			background-color: #306FAB;
			border-radius: 5px;
			border: 1px solid #306FAB;
			color: #FFFFFF;
			padding: 4px 8px;
		}
		.detmanager-boton:hover {
			background-color: #0C5AA6;
			border: 1px solid #0C5AA6;
			cursor: pointer;
			color: #FFFFFF;
			padding: 4px 8px;
		}
		input.detmanager-boton:focus {
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

      static toDetTable(tableId, config = {}) {
		if(Object.keys(config).length == 0)
			return console.error("Parametro %cconfiguration vacio. Imposible convertir a tabla detalle.", "font-style:italic;color:#C7C;");

		if(!config.dbtable)
			return console.error("DB Table no esta definido en configuracion");

		if(!config.dbcolumns)
			return console.error("DB Columns no definido en configuracion");

		if(!config.cells)
			return console.error("Especificaciones en las celdas no definidas. No se puede proceder.");

		let
		tabla = document.getElementById(tableId),
		parent = tabla.parentElement,
		title = config.title,
		add = config.addAct,
		upd = config.updAct,
		columns = config.dbcolumns,
		cellsDef = config.cells;

		// Actualizar data de las PKs
		this.setDatasetToPKs(columns.pkFields);

		// Colocar titulo en la tabla.
		this.putTitle({tableId: tableId, locationElement: parent, titleLabel: title.label, displayShortcuts: title.displayShortcuts});

		// Poner boton para agregar nuevo item.
		this.putAddButton({tableId: tableId, locationElement: add.location, buttonLabel: add.label, buttonId: add.id, attrs: add.attrs});

		// Transformar celdas existentes en campos editables, basado en las definiciones.
		this.transformExistingCells({tableId: tableId, columnsDefinition: columns.tableFields, pkDefinitions: columns.pkFields, cellsDefinition: cellsDef});

		// Asignar Ids con las columnas.
		this.setIdsByColumns({tableId: tableId, dbcolumns: columns, cells: cellsDef});

		// Poner boton de Actualizar
		this.putUpdateButton({tableId: tableId, updateAction: upd, pkColumnsDef: columns.pkFields, cellsDef: cellsDef});

		// Agregar accion de Actualizar al updButton

		// Poner boton de eliminar



		// Asignar accion a AddButton
	}

	static putUpdateButton({
		tableId="",
		updateAction={
			label: "Actualizar",
			clases: ['detmanager-boton'],
			attrs: []
		},
		pkColumnsDef=["empresa:number:input#EMPRESA"],
		cellsDef={
			totalized: true,
			hasTHead: false
		}
	} = {}) {
		if(tableId.length == 0)
			return console.error("[putUpdateButton]: Table Id not defined!");

		let tabla = document.getElementById(tableId),
		tBody = tabla.querySelectorAll("tbody")[0],
		rows = tBody.rows,
		pbId = "DetMngr_PbUpd_",
		suffix = "",
		updElem = document.createElement('input');

		pkColumnsDef.forEach(colStr => {
			// Ej. "empresa:number:input#EMPRESA"
			let info = colStr.split(':');
			let pkFieldId = info[2].split('#')[1]; // EMPRESA
			let pkValue = document.getElementById(pkFieldId).value;

			suffix += pkValue;
		});

		updElem.type = 'button';
		if(updateAction.clases)
			updateAction.clases.forEach(cssClass => updElem.classList.add(cssClass));
		updElem.value = updateAction.label;
		updElem.dataset.action = "update";
		if(updateAction.attrs)
			updateAction.attrs.forEach( elem => updElem.setAttribute(elem.att, elem.val));

		rows = this.getCuratedRows({rowsArr: rows, hasTHead: cellsDef.hasTHead, totalized: cellsDef.totalized});

		for(let row of rows) {
			let lineValue = row.querySelector("[data-indicator='true']").value;
			let cells = row.cells;

			suffix += lineValue;
			pbId += suffix;
			updElem.id = pbId;

			cells[cells.length - 1].append(updElem);
		}
	}

	static setDatasetToPKs(pkColumnsDef=[]) {
		pkColumnsDef.forEach(strSpec => {
			let arrSpecs = strSpec.split(':');
			if( this.fieldExists(arrSpecs) ) {
				let id = arrSpecs[2].split('#')[1];
				document.getElementById(id).dataset.dbcolumn = arrSpecs[0];
				document.getElementById(id).dataset.type = arrSpecs[1];
			}
		});
	}

	static getCuratedRows({rowsArr, hasTHead, totalized}) {
		let newRowArr = [];
		for(let row of rowsArr) {
			if(!hasTHead) {
				if(row.rowIndex == 0)
					continue;
				if(totalized && (row.rowIndex + 1) == rowsArr.length)
					continue;
			}
			if(hasTHead && totalized && row.rowIndex == rowsArr.length)
				continue;
			newRowArr.push(row);
		}
		return newRowArr;
	}

	static getSpecificProp({specificColnameDefs={default: {clases:[], attrs: []}}, colname="default", propName=""} = {}) {
		if(specificColnameDefs[colname])
			return specificColnameDefs[colname][propName];
		else
			return [];
	}

	static transformExistingCells({tableId, columnsDefinition=[], pkDefinitions=[], cellsDefinition={defins: {}}} = {}) {
		let table = document.getElementById(tableId),
		tblBody = table.querySelectorAll('tbody')[0],
		rows = tblBody.rows;

		rows = this.getCuratedRows({rowsArr: rows, hasTHead: cellsDefinition.hasTHead, totalized: cellsDefinition.totalized});

		for( let row of rows ) {
			let cells = row.cells;
			for( let cell of cells ) {
				let colname = columnsDefinition[cell.cellIndex] ? columnsDefinition[cell.cellIndex].split(':')[0] : "";
				let specificFieldClasses = this.getSpecificProp({specificColnameDefs: cellsDefinition.defins, colname: colname, propName: 'clases'});
				let specificFieldAttribs = this.getSpecificProp({specificColnameDefs: cellsDefinition.defins, colname: colname, propName: 'attrs'});
				let value = cell.innerHTML.trim();
				let fieldDef = this.getFieldDefinition(columnsDefinition[cell.cellIndex]);
				let fieldElem = "";

				if( fieldDef !== 'combo' ) {
					fieldDef.cssClasses = [ ...cellsDefinition.globalClases, ...specificFieldClasses ?? [] ];
					fieldDef.elementAttributes = specificFieldAttribs;
					fieldElem = this.getDataFieldByDefinition(fieldDef);
				} else {
					let comboClases = [ ...cellsDefinition.globalClases, ...specificFieldClasses ?? [] ];
					let comboAttribs = specificFieldAttribs;
					fieldElem = this.getComboElement({definitionStr: columnsDefinition[cell.cellIndex], classes: comboClases, attrs: comboAttribs});
				}

				cell.innerHTML = '';
				cell.append(fieldElem);

				fieldElem.value = value;
			}
		}

	}

	static getIndicatorValueByCells(cellsArr=[]) {
		let indicatorValue = -1;
		for(let cell of cellsArr) {
			let fields = cell.querySelectorAll("input, select");
			fields.forEach(elem => {
				if(elem.dataset.indicator == 'true')
					indicatorValue = elem.value;
			});
		}

		return indicatorValue;
	}

	static setIdsByColumns({tableId="", dbcolumns={pkFields:[], tableFields:[]}, cells={hasTHead: false, totalized: true}} = {}) {
		let tabla = document.getElementById(tableId),
		tBody = tabla.querySelectorAll('tbody')[0],
		rows = tBody.rows,
		id = "",
		suffix = "";

		rows = this.getCuratedRows({rowsArr: rows, hasTHead: cells.hasTHead, totalized: cells.totalized});

		dbcolumns.pkFields.forEach(colStr => {
			// Ej. "empresa:number:input#EMPRESA"
			let info = colStr.split(':');
			let pkFieldId = info[2].split('#')[1]; // EMPRESA
			let pkValue = document.getElementById(pkFieldId).value;

			suffix += pkValue;
		});

		for(let row of rows) {
			let rowCells = row.cells;
			let indicatorValue = this.getIndicatorValueByCells(rowCells);
			suffix += indicatorValue;
			for(let cell of rowCells) {
				if(dbcolumns.tableFields[cell.cellIndex]) {
					id = "DetMngr_";
					// "linea:number:input:INDICATOR"
					let fieldInfo = dbcolumns.tableFields[cell.cellIndex].split(":");
					let elemTag = fieldInfo[2];
					let elem = cell.querySelector(elemTag);

					id += fieldInfo[0].toUpperCase();
					id += suffix;

					elem.id = id;
				} else
					continue;
			}
		}
	}

	static fieldExists(arrSpecs) {
		let exists = false;
		arrSpecs.forEach(elem => {
			let id = elem.split('#')[1];
			if(document.getElementById(id))
				exists = true;
		});

		return exists;
	}

	static getComboElement({definitionStr="", classes=[], attrs=[]} = {}) {
		// Ejemplos:
		// clase_producto:number:select:1=Maduro, 2=Pergo, 3=Humedo
		// proyecto:number:select:SRC#PROYECTO
		let selectElement = document.createElement('select');
		let arrSpecs = definitionStr.split(':');

		if( this.fieldExists(arrSpecs) ) { // Proviene de un nodo existente.
			let id = arrSpecs[3].split('#')[1];
			selectElement = document.getElementById(id).cloneNode(true);
		} else { // Tiene sus opciones.
			selectElement = document.createElement('select');
			let opts = arrSpecs[3].split(',');
			opts.forEach(opt => {
				let info = opt.split('=');
				let option = document.createElement('option');
				option.value = info[0].trim();
				option.innerText = info[1].trim();

				selectElement.append(option);
			});
		}

		selectElement.classList.forEach(clase => selectElement.classList.remove(clase));
		selectElement.removeAttribute('id');
		selectElement.removeAttribute('name');
		selectElement.dataset.type = arrSpecs[1];
		selectElement.dataset.dbcolumn = arrSpecs[0];
		classes.forEach( cssClass => selectElement.classList.add(cssClass) );
		attrs.forEach( attrib => selectElement.setAttribute(attrib.att, attrib.val) );

		return selectElement;

	}

	static getFieldDefinition(defString="") {
		let arrSpecs = defString.split(':'),
		fieldDefinition = {},
		isComboBox = false;

		isComboBox = arrSpecs.includes('select');
		if( isComboBox )
		    return 'combo';

		fieldDefinition.elementTag = arrSpecs[2];
		fieldDefinition.fieldType = arrSpecs[1];
		fieldDefinition.colname = arrSpecs[0];
		fieldDefinition.dataType = arrSpecs[1];
		if( arrSpecs.includes('INDICATOR') )
		    fieldDefinition.isIndicator = true;

		return fieldDefinition;

	}

	static getDataFieldByDefinition(fieldDefinition) {
		let element = undefined;

		element = document.createElement(fieldDefinition.elementTag);

		if(fieldDefinition.type)
			element.type = fieldDefinition.fieldType;

		if(fieldDefinition.isIndicator) {
			element.dataset.indicator = fieldDefinition.isIndicator;
			if( fieldDefinition.isIndicator )
				element.disabled = true;
		}

		if(fieldDefinition.dataType)
			element.dataset.type = fieldDefinition.dataType;

		if(fieldDefinition.colname)
			element.dataset.dbcolumn = fieldDefinition.colname;

		if(fieldDefinition.cssClasses)
			fieldDefinition.cssClasses.forEach( cssClass => element.classList.add(cssClass) );

		if(fieldDefinition.elementStyle)
			fieldDefinition.elementStyle.forEach( elem => element.style[elem.prop] = elem.value );

		if(fieldDefinition.elementAttributes)
			fieldDefinition.elementAttributes.forEach( attrib => element.setAttribute(attrib.att, attrib.val) );

		return element;
	}

	static putAddButton({tableId, locationElement="default", buttonLabel="Agregar Item", buttonId="pbDetManagerAddItem", cssClases=['detmanager-boton'], attrs=[{att: 'title', val: 'Agregar nuevo Item'}]} = {}) {
		if(locationElement == "default") locationElement = document.getElementById(`DetManager_${tableId}_Detail_Actions`);


		let buttonComponent = `<input type="button" value="${buttonLabel}" id="${buttonId}" class="${cssClases.join(' ')}">`;

		locationElement.innerHTML = buttonComponent + locationElement.innerHTML;

		attrs.forEach(attr => {
			document.getElementById(buttonId).setAttribute(attr.att, attr.val);
		});
	}

	static putTitle({tableId, locationElement, titleLabel="ITEMS", displayShortcuts=false} = {}) {
		if(!locationElement) return console.error("Parametro %clocationElement no definido!", "font-style:italic;color:#07C;");

		let titleComponent = `${this.detStyle}
			<div class="detmanager-table-det-block" id="Detail_Title">
				<div style="display:inline-block" id="DetManager_${tableId}_Detail_Actions"></div>
				<div class="detmanager-table-det-title"> ${titleLabel} </div>
				<div ${displayShortcuts ? "style='display:inline-block'" : "style='display:none'"}>
					<b class="detmanager-shortcut-label"> F3 </b><span> Agregar &nbsp; </span>
					<b class="detmanager-shortcut-label"> F4 </b><span> Grabar  &nbsp; </span>
					<b class="detmanager-shortcut-label"> F6 </b><span> Actualizar &nbsp; </span>
					<b class="detmanager-shortcut-label"> F10 </b><span> Eliminar </span>
				</div>
			</div>`;

		locationElement.innerHTML = titleComponent + locationElement.innerHTML;
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

			if(spec.siblingsDefinition) {
				for(let sibSpec of spec.siblingsDefinition) {
					newElement = this.createDataField(sibSpec);

					if(newElement.dataset.indicator == "true")
						newElement.value = rowLength - 1;

					newCell.innerHTML += newElement.outerHTML;
				}
			}
		}

		console.log(newRow.outerHTML);
	}
}