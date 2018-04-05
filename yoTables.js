/**
 * @author Yoannes
 * @version 1.0.2
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
function YoTables(el, params) {
  var element = document.querySelector(el);
  var yoTablesId = 'yoTables-'+ element.id;
  var originalData = [];
  var data = [];
  var headers = [];
  var currentPage = 1;
  var totalPages = 0;
  var rowsPerPage = 0;
  var onClick = params.onClick;
  var hover = 'hover' in params ? params.hover : true;
  var striped = 'striped' in params ? params.striped : true;
  var searchable = 'searchable' in params ? params.searchable : true;

  var searchDelay = params.searchDelay ? params.searchDelay : 300;

  // CREATE ROW/COL HTML
  var rowHtml = function (rowId, colData) {
    var colHtml = '';
    for (var colId=0; colId < colData.length; colId++) {
      var tdClass = [yoTablesId +'-td', yoTablesId +'-td-' + rowId + '-' + colId];
      var tdStyle = [];
      var tdContent = [colData[colId]];
      // console.log('col:', colId);
      if (headers[colId].style) {
        tdStyle.push(headers[colId].style.join(';'));
      }
      if (onClick)
        tdStyle.push('cursor: pointer');

      colHtml += '<td class="'+ tdClass.join(' ') +'" style="'+ tdStyle.join(' ') +'" data-coords="['+rowId+','+colId+']">'+ tdContent.join(' ') +'</td>';
    }

    return '<tr class="'+ yoTablesId +'-tr '+ yoTablesId +'-tr-'+rowId+'" data-rowid="'+rowId+'">'+ colHtml +'</tr>';
  };

  // CREATE ARRAY WITH ROW'S HTML
  var createRowsArray = function (data) {
    var r = [];

    for (var rowId=0; rowId < data.length; rowId++) {
      // console.log('row:', rowId, data[rowId]);

      r.push({
        data: data[rowId],
        html: rowHtml(rowId, data[rowId])
      });
    }

    return r;
  };

  // CREATE ROWS HTML LIMITING THE QUANTITY PER PAGE
  var createRows = function (rPerPage, cPage, dt) {
    var h = '';
    var start = (cPage-1) * rPerPage;
    var end = start + rPerPage;

    for (var i=start; i < end; i++) {
      if (i < data.length)
        h += dt[i].html;
    }

    return h;
  };

  // CREATE AND RENDER PAGINATION BUTTONS
  var createPagination = function () {
    var pages = '';
    var start = currentPage - 5;
    var end = currentPage + 5;

    if (start < 0) start = 0;
    if (end > totalPages) end = totalPages;

    var skip =
      '<li class="page-item yoTables-pagination-item" data-yotablespage="SKIP">' +
        '<a class="page-link" href="#">...</a>' +
      '</li>';

    if (start > 0)
      pages +=
        '<li class="page-item yoTables-pagination-item" data-yotablespage="0">' +
          '<a class="page-link" href="#">1</a>' +
        '</li>' +
        skip;

    for (var i=start; i < end; i++) {
      pages +=
        '<li class="page-item yoTables-pagination-item '+(i+1 === currentPage ? 'active' : '')+'" data-yotablespage="'+i+'">' +
          '<a class="page-link" href="#">'+(i+1)+'</a>' +
        '</li>';
    }

    if (end < totalPages)
      pages +=
        skip +
        '<li class="page-item yoTables-pagination-item" data-yotablespage="'+(totalPages-1)+'">' +
          '<a class="page-link" href="#">'+totalPages+'</a>' +
        '</li>';

    var ul = '<ul class="pagination-'+yoTablesId+' pagination pagination-sm justify-content-center">'+pages+'</ul>';

    var pag =
      '<div style="width: 100%; text-align: center; margin-top: -15px"><span class="badge badge-secondary">' +
        '<span class="yoTables-currentPage">'+ currentPage +'</span> of <span class="yoTables-totalPages">'+totalPages+'</span></span>' +
      '</div>';

    // console.log(currentPage, totalPages);

    var div = document.querySelector('.yoTables-pagination');
    div.innerHTML = ul + pag;

    $(".yoTables-pagination-item")
      .off('click.tables')
      .on('click.tables', function (ev) {
        ev.preventDefault();

        var p = $(this).data('yotablespage');
        if (p === "SKIP") return;

        currentPage = p+1;

        var rClass = document.querySelectorAll('.yoTables-pagination-item');
        for (var i=0; i < rClass.length; i++)
          rClass[i].classList.remove('active');

        this.classList.add('active');

        $('.yoTables-currentPage').text( currentPage );

        // UPDATE TBODY OF TABLE
        $('.yoTables-tbody').html(createRows(rowsPerPage, currentPage, data));

        if (onClick)
          clickListener();

        createPagination();
      });
  };

  // FUNCTION TO RENDER THE TABLE
  var renderTable = function () {
    totalPages = Math.ceil(data.length / rowsPerPage);
    var h = '';

    for (var i=0; i < headers.length; i++) {
      var v = headers[i];
      h += v.html;
    }

    var thead = '<thead class="yoTables-thead"><tr>'+ h +'</tr></thead>';
    var tbody = '<tbody class="yoTables-tbody">'+ createRows(rowsPerPage, currentPage, data) +'</tbody>';
    var searchEl = document.querySelector('#yoTablesSearchInput');
    var search = '';
    if (searchable) {
      search =
        '<div class="float-right" style="width: 200px; margin-bottom: 5px">' +
          '<input type="text" class="form-control" id="yoTablesSearchInput" placeholder="Search" value="'+(searchEl ? searchEl.value : '')+'">' +
        '</div>';
    }

    element.innerHTML =
      '<div class="yoTables-header">' + search + '</div>' +
      '<table class="yoTables-table table '+(hover ? 'table-hover' : '')+' '+(striped ? 'table-striped' : '')+'">'+thead + tbody+'</table>' +
      '<div class="yoTables-pagination"></div>';

    createPagination(currentPage);

    if (searchable) {
      searchEl = document.querySelector('#yoTablesSearchInput');
      if (searchEl) {
        searchEl.focus();
        searchEl.selectionStart = searchEl.selectionEnd = searchEl.value.length;
      }
    }


    // CLICK LISTENER
    if (onClick)
      clickListener();

    $('#yoTablesSearchInput').on('keyup.tables', (function(){
      var timer = 0;
      return function(){
        clearTimeout (timer);
        timer = setTimeout(function () {
          var input = document.querySelector('#yoTablesSearchInput');
          filter(input.value);

        }, searchDelay);
      };
      // App.global.delay(function(){ functionToCall(); }, milliseconds );
    })());
  };

  var filter = function (val) {
    var i, v;
    var loopRow = function (row) {
      for (var i=0; i < row.length; i++) {
        if (row[i].toString().search(val) > -1)
          return true;
      }
    };

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

    // console.log('start search');
    var newData = [];
    for (i=0; i < data.length; i++) {
      v = data[i];
      if (loopRow(v.data))
        newData.push(v);
    }
    data = newData;
    // console.log('end search', originalData.length, data.length);

    renderTable()
  };

  var clickListener = function () {
    $('.'+yoTablesId+'-td')
      .off('click.tables')
      .on('click.tables', function () {
        var dt = $(this).data('coords');
        onClick(dt, data[dt[0]]);
      });
  };

  // SET THE QUANTITY OF ROWS PER PAGE
  if (params.rowsPerPage)
    rowsPerPage = params.rowsPerPage;

  else if (!rowsPerPage)
    rowsPerPage = 5;

  // CREATE HEADERS HTML
  if (params.headers) {
    // console.log(params.headers);
    headers = params.headers;
    for (var colId=0; colId < params.headers.length; colId++) {
      var header = headers[colId];
      var thContent = header.name;

      if (header.sorting) {
        thContent = '<span class="'+yoTablesId+'-sort" data-colid="'+colId+'" style="cursor: pointer">'+ header.name +'</span>';
      }

      header.html = '<th class="'+yoTablesId+'-head-'+colId+'">'+ thContent +'</th>';
      // console.log(header);
    }
  }
  else {
    console.log("no headers!");
    return;
  }

  // IF DATA, PROCESS IT
  if (params.data)
    data = createRowsArray(params.data);

  // RENDER THE TABLE
  renderTable();

  this.updateCell = function (coords, newData) {
    if (coords.constructor === Array){
      if (coords.length === 2) {
        var rowId = coords[0];
        var colId = coords[1];
        var elClass = [yoTablesId, 'td', rowId, colId].join('-');
        var cell = document.querySelector('.'+ elClass);
        var rowData = data[rowId].data;

        if (cell) {
          rowData[colId] = newData;
          cell.innerHTML = newData;
          data[rowId].html = rowHtml(rowId, rowData);
        }

        // console.log(elClass, cell, data[rowId]);
      }
    }
  };

  this.updateRow = function (coords, newData) {
    if (newData.constructor === Array && newData.length === headers.length) {
      var rowId = coords[0];

      for (var colId=0; colId < headers.length; colId++) {
        var elClass = [yoTablesId, 'td', rowId, colId].join('-');
        var cell = document.querySelector('.'+ elClass);
        if (cell)
          cell.innerHTML = newData[colId];
      }

      data[rowId].data = newData;
      data[rowId].html = rowHtml(rowId, newData);
      // console.log(data[rowId]);
    }
  };

  this.updateFromHeader = function (headerName, val, newData) {
    // LOOP HEADERS TO GET colId
    for (var colId=0; colId < headers.length; colId++) {
      if (headers[colId].name === headerName) {

        // LOOP DATA TO GET rowId
        for (var rowId=0; rowId < data.length; rowId++) {
          if (data[rowId].data[colId].toString() === val.toString()) {

            // UPDATE ROW'S DATA
            for (var i=0; i < headers.length; i++) {
              var elClass = [yoTablesId, 'td', rowId, i].join('-');
              var cell = document.querySelector('.'+ elClass);
              if (cell)
                cell.innerHTML = newData[i];
            }

            // UPDATE OBJECT WITH NEW DATA
            data[rowId].data = newData;
            data[rowId].html = rowHtml(rowId, newData);

            break;
          }
        }

        break;
      }
    }
  };

  this.getCell = function (coords) {
    var rowId = coords[0];
    var colId = coords[1];
    var row = data[rowId].data;

    return row[colId];
  };

  this.getRow = function (coords) {
    var rowId = coords[0];

    return data[rowId].data;
  };

}