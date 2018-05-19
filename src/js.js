/**
 * @author Yoannes
 * @version 1.0.3
 * @license MIT
 */


/**
 * Init table function
 * @param {string}   el                 - ID or class of the element
 * @param {object}   params             - Params of the table
 * @param {object}   params.hover       - Uses hover class from Bootstrap
 * @param {object}   params.striped     - Uses striped class from Bootstrap
 * @param {object}   params.rowsPerPage - Number of rows per page. Default 5
 * @param {array}    params.headers     - Array of headers of the table
 * @param {array}    params.data        - Array of data of the table
 * @param {function} params.onClick     - Callback function when row is clicked
 * @param {number}   params.searchable  - Search option in table
 * @param {number}   params.searchDelay - Delay on search input in ms
 */
window.YoTables = function (el, params) {
  let element = document.querySelector(el);
  let yoTablesId = `yoTables-${element.id}`;

  let originalData = [];
  let data = [];
  let displayData = [];

  let headers = [];
  let currentPage = 1;
  let totalPages = 0;

  let onClick = params.onClick;
  let hover = params.hover === true;
  let striped = params.striped === true;
  let searchable = params.searchable === true;
  let searchDelay = params.searchDelay ? params.searchDelay : 300;

  let rowsPerPage = 0;

  // SET THE QUANTITY OF ROWS PER PAGE
  if (params.rowsPerPage)
    rowsPerPage = params.rowsPerPage;
  else if (!rowsPerPage)
    rowsPerPage = 5;

  // CREATE HEADERS HTML
  if (params.headers) {
    console.log("headers", params.headers);
    for (let i=0; i < params.headers.length; i++) {
      let v = params.headers[i];
      headers.push({
        name: v.name,
        html: `<th class="${yoTablesId}-head-${i}">${v.name}</th>`,
        disableClick: v.disableClick === true,
        style: v.style ? v.style : null
      });
    }
  }
  else {
    console.log("no headers!");
    return;
  }

  // IF DATA, PROCESS IT
  if (params.data) {
    for (let i=0; i < params.data.length; i++) {
      let v = params.data[i];
      // originalData.push(v);
      data.push(v);
    }
  }

  // RENDER THE TABLE
  renderTable();

  // CREATE ROW/COL HTML
  function createRowHtml(rowId, colData) {
    let colHtml = '';
    for (let colId=0; colId < colData.length; colId++) {
      let tdClass = [`${yoTablesId}-td`, `${yoTablesId}-td-${rowId}-${colId}`];
      let tdStyle = [];
      let tdContent = [colData[colId]];

      if (headers[colId].style)
        tdStyle.push(headers[colId].style.join(';'));

      if (onClick && !headers[colId].disableClick)
        tdStyle.push('cursor: pointer');

      colHtml += `<td class="${tdClass.join(' ')}" style="${tdStyle.join(' ')}" data-coords="[${rowId},${colId}]">${tdContent.join(' ')}</td>`;
    }

    return `<tr class="${yoTablesId}-tr ${yoTablesId}-tr-${rowId}" data-rowid="${rowId}">${colHtml}</tr>`;
  }

  // CREATE ROWS HTML LIMITING THE QUANTITY PER PAGE
  function getPageRowsHtml(rPerPage, cPage, dt) {
    let h = '';
    let start = (cPage-1) * rPerPage;
    let end = start + rPerPage;

    for (let i=start; i < end; i++) {
      console.log(i);
      if (i < data.length)
        h += createRowHtml(i, dt[i]);
    }

    return h;
  }

  // CREATE AND RENDER PAGINATION BUTTONS
  function createPagination() {
    let pages = '';
    let start = currentPage - rowsPerPage;
    let end = currentPage + rowsPerPage;

    if (start < 0) start = 0;
    if (end > totalPages) end = totalPages;

    let skip =
      `<li class="page-item ${yoTablesId}-pagination-item" data-yotablespage="SKIP">` +
      '<a class="page-link" href="#">...</a>' +
      '</li>';

    if (start > 0)
      pages +=
        `<li class="page-item ${yoTablesId}-pagination-item" data-yotablespage="0">` +
        '<a class="page-link" href="#">1</a>' +
        '</li>' +
        skip;

    for (let i=start; i < end; i++) {
      pages +=
        `<li class="page-item ${yoTablesId}-pagination-item ${i + 1 === currentPage ? 'active' : ''}" data-yotablespage="${i}">` +
          `<a class="page-link" href="#">${i + 1}</a>` +
        `</li>`;
    }

    if (end < totalPages)
      pages +=
        skip +
        `<li class="page-item ${yoTablesId}-pagination-item" data-yotablespage="${totalPages - 1}">` +
        `<a class="page-link" href="#">${totalPages}</a>` +
        `</li>`;

    let ul = `<ul class="pagination-${yoTablesId} pagination pagination-sm justify-content-center">${pages}</ul>`;

    let pag =
      `<div style="width: 100%; text-align: center; margin-top: -15px">` +
        `<span class="badge badge-secondary">` +
          `<span class="${yoTablesId}-currentPage">${currentPage}</span> of <span class="${yoTablesId}-totalPages">${totalPages}</span>` +
        `</span>` +
      `</div>`;


    let div = document.querySelector(`.${yoTablesId}-pagination`);
    div.innerHTML = ul + pag;

    $(`.${yoTablesId}-pagination-item`)
      .off('click.tables')
      .on('click.tables', function (ev) {
        ev.preventDefault();

        let p = $(this).data('yotablespage');
        if (p === "SKIP") return;

        currentPage = p+1;

        let rClass = document.querySelectorAll(`.${yoTablesId}-pagination-item`);
        for (let i=0; i < rClass.length; i++)
          rClass[i].classList.remove('active');

        this.classList.add('active');

        $(`.${yoTablesId}-currentPage`).text( currentPage );

        // UPDATE TBODY OF TABLE
        $(`.${yoTablesId}-tbody`).html(getPageRowsHtml(rowsPerPage, currentPage, data));

        if (onClick)
          clickListener();

        createPagination();
      });
  }

  // FUNCTION TO RENDER THE TABLE
  function renderTable() {
    let searchEl = document.querySelector(`#${yoTablesId}-SearchInput`);
    let search = '';
    if (searchable) {
      search =
        `<div class="float-right" style="width: 200px; margin-bottom: 5px">` +
        `<input type="text" class="form-control" id="${yoTablesId}-SearchInput" placeholder="Search" value="${searchEl ? searchEl.value : ''}">` +
        `</div>`;
    }

    if (document.querySelector(`.${yoTablesId}-header`)) {
      console.log('update');
      $(`.${yoTablesId}-tbody`).html(getPageRowsHtml(rowsPerPage, currentPage, data ? data : originalData));
    }
    else {
      let h = '';
      for (let i=0; i < headers.length; i++) {
        let v = headers[i];
        h += v.html;
      }

      let thead = `<thead class="${yoTablesId}-thead"><tr>${h}</tr></thead>`;
      let tbody = `<tbody class="${yoTablesId}-tbody">${getPageRowsHtml(rowsPerPage, currentPage, data)}</tbody>`;

      element.innerHTML =
        `<div class="${yoTablesId}-header">${search}</div>` +
        `<table class="${yoTablesId}-table table ${hover ? 'table-hover' : ''} ${striped ? 'table-striped' : ''}">${thead}${tbody}</table>` +
        `<div class="${yoTablesId}-pagination"></div>`;
    }

    // return;

    totalPages = Math.ceil(data.length / rowsPerPage);

    createPagination();

    if (searchable) {
      searchEl = document.querySelector(`#${yoTablesId}-SearchInput`);
      if (searchEl) {
        searchEl.focus();
        searchEl.selectionStart = searchEl.selectionEnd = searchEl.value.length;
      }
    }

    // CLICK LISTENER
    if (onClick)
      clickListener();

    $(`#${yoTablesId}-SearchInput`)
      .off('keyup.tables')
      .on('keyup.tables', (function(){
        let timer = 0;
        return function(){
          clearTimeout (timer);
          timer = setTimeout(function () {
            let input = document.querySelector(`#${yoTablesId}-SearchInput`);
            filter(input.value);
          }, searchDelay);
        };
      })());
  }

  function filter(val) {
    let i, v;

    function loopRow(row) {
      for (let i=0; i < row.length; i++) {
        let v;
        if (row[i]) {
          if (!/<[a-z][\s\S]*>/i.test(row[i])) {
            v = row[i].toString().toLowerCase();
          }
          else {
            let $e = $(row[i]);
            v = $e.val() || $e.text();
            v = v.toString().toLowerCase();
          }
          if (v.search(val) > -1)
            return true;
        }
      }
    }

    if (!originalData.length && val) {
      for (i=0; i < data.length; i++) {
        originalData.push(data[i]);
      }
    }
    else if (originalData.length && !val) {
      data = [];
      for (i=0; i < originalData.length; i++) {
        data.push(originalData[i]);
      }
      originalData = [];
    }
    else if (originalData.length && !data.length) {
      data = [];
      for (i=0; i < originalData.length; i++) {
        data.push(originalData[i]);
      }
    }

    let newData = [];
    for (i=0; i < data.length; i++) {
      if (loopRow(data[i]))
        newData.push(data[i]);
    }
    data = newData;

    renderTable()
  }

  function clickListener() {
    $('.'+yoTablesId+'-td')
      .off('click.tables')
      .on('click.tables', function () {
        let dt = $(this).data('coords');

        if (!headers[dt[1]].disableClick) {
          if (originalData.length)
            onClick(dt, originalData[dt[0]]);
          else
            onClick(dt, data[dt[0]]);
        }
      });
  }

  this.updateCell = function (coords, newData) {
    if (coords.constructor === Array){
      if (coords.length === 2) {
        let rowId = coords[0];
        let colId = coords[1];
        let elClass = [yoTablesId, 'td', rowId, colId].join('-');
        let cell = document.querySelector('.'+ elClass);
        let rowData;
        if (originalData.length)
          rowData = originalData[rowId];
        else
          rowData = data[rowId];

        if (cell) {
          rowData[colId] = newData;
          cell.innerHTML = newData;
          data[rowId].html = createRowHtml(rowId, rowData);
        }

        // console.log(elClass, cell, data[rowId]);
      }
    }
  };

  this.updateRow = function (coords, newData) {
    if (newData.constructor === Array && newData.length === headers.length) {
      let rowId = coords[0];

      for (let colId=0; colId < headers.length; colId++) {
        let elClass = [yoTablesId, 'td', rowId, colId].join('-');
        let cell = document.querySelector('.'+ elClass);
        if (cell)
          cell.innerHTML = newData[colId];
      }

      if (originalData.length)
        originalData[rowId] = newData;
      else
        data[rowId] = newData;

      renderTable();
    }
  };

  this.updateFromHeader = function (headerName, val, newData) {
    // LOOP HEADERS TO GET colId
    for (let colId=0; colId < headers.length; colId++) {
      if (headers[colId].name === headerName) {

        // LOOP DATA TO GET rowId
        for (let rowId=0; rowId < data.length; rowId++) {
          if (data[rowId][colId].toString() === val.toString()) {

            // UPDATE ROW'S DATA
            for (let i=0; i < headers.length; i++) {
              let elClass = [yoTablesId, 'td', rowId, i].join('-');
              let cell = document.querySelector(`.${elClass}`);
              if (cell)
                cell.innerHTML = newData[i];
            }

            // UPDATE OBJECT WITH NEW DATA
            if (originalData.length) {
              originalData[rowId] = newData;
            }
            else {
              data[rowId] = newData;
            }

            break;
          }
        }

        break;
      }
    }
  };

  this.getCell = function (coords) {
    let rowId = coords[0];
    let colId = coords[1];
    let row;

    if (originalData.length)
      row = originalData[rowId];
    else
      row = data[rowId];

    return row[colId];
  };

  this.getRow = function (coords) {
    let rowId = coords[0];

    if (originalData.length)
      return originalData[rowId];
    else
      return data[rowId];
  };
};