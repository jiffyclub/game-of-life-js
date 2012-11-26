var GLOBALS = {};

// make these multiples of cell_size
GLOBALS['cell_size'] = 10;
GLOBALS['canvas_width'] = window.innerWidth -
    (window.innerWidth % GLOBALS['cell_size']) + GLOBALS['cell_size'];
GLOBALS['canvas_height'] = window.innerHeight -
    (window.innerHeight % GLOBALS['cell_size']) + GLOBALS['cell_size'];

// wait time between updates
GLOBALS['interval'] = 200;
GLOBALS['interval_id'] = null;


// add canvas to the page
function add_canvas() {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'cgol-canvas');
    canvas.setAttribute('width', GLOBALS   ['canvas_width']);
    canvas.setAttribute('height', GLOBALS['canvas_height']);
    document.body.appendChild(canvas);

    return canvas.getContext('2d');
}


// Adapted from Javascript: The Good Parts by Douglas Crockford
function zeros() {
    var a, i, j, m, n, mat = [];

    m = GLOBALS['canvas_height'] / GLOBALS['cell_size'];
    n = GLOBALS['canvas_width'] / GLOBALS['cell_size'];

    for (i = 0; i < m; i++) {
        a = [];

        for (j = 0; j < n; j++) {
            a[j] = 0;
        }
        mat[i] = a;
    }
    mat['rows'] = m;
    mat['cols'] = n;

    return mat;
}

// Randomly makes some of the cells 1
function initialize_cells(cells) {
    var i, j;

    for (i = 0; i < cells['rows']; i++) {
        for (j = 0; j < cells['cols']; j++) {
            if (Math.random() < 0.5) {
                cells[i][j] = 1;
            }
        }
    }

    return cells;
}


function draw_cells(context, cells) {
    var i, j, x, y;

    for (i = 0; i < cells['rows']; i++) {
        for (j = 0; j < cells['cols']; j++) {
            if (cells[i][j] === 1) {
                context.fillStyle = '#999';
            } else {
                context.fillStyle = '#DDD';
            }

            from_top = i * GLOBALS['cell_size'];
            from_left = j * GLOBALS['cell_size'];
            context.fillRect(from_left, from_top,
                             GLOBALS['cell_size'], GLOBALS['cell_size']);
        }
    }
}


function copy_cells(source, dest) {
    var i, j;

    for (i = 0; i < source['rows']; i++) {
        for (j = 0; j < source['cols']; j++) {
            dest[i][j] = source[i][j];
        }
    }

    return dest;
}

// modify cells with the next generation
function update(cells) {
    var i, j, k, l;
    var old_cells, live_neighbors;
    var col_min, col_max, row_min, row_max;

    old_cells = copy_cells(cells, zeros());

    for (i = 0; i < cells['rows']; i++) {
        for (j = 0; j < cells['cols']; j++) {
            live_neighbors = 0;

            row_min = Math.max(0, i - 1);
            row_max = Math.min(cells['rows'], i + 2);
            col_min = Math.max(0, j - 1);
            col_max = Math.min(cells['cols'], j + 2);

            for (k = row_min; k < row_max; k++) {
                for (l = col_min; l < col_max; l++) {
                    if (old_cells[k][l] === 1) {
                        live_neighbors++;
                    }
                }
            }

            // cell alive in previous generation
            if (old_cells[i][j] === 1) {
                live_neighbors--; // we double counted this one

                // cell dies in next generation
                if (live_neighbors !== 2 && live_neighbors !== 3) {
                    cells[i][j] = 0;
                }
            } else {
                // dead cell comes back to life
                if (live_neighbors === 3) {
                    cells[i][j] = 1;
                }
            }
        }
    }

    return cells;
}


function init_sim() {
    GLOBALS['cells'] = initialize_cells(zeros());
}


function run_sim() {
    var cells = GLOBALS['cells'];
    var context = GLOBALS['context'];

    update(cells);
    draw_cells(context, cells);
}


// remove the help box if it exists
function clear_help() {
    var div = document.getElementById('help-box');
    if (div) {
        document.body.removeChild(div);
    }
}


// show a help describing the available key commands
function show_help() {
    var div;

    clear_help();

    div = document.createElement('div');
    div.setAttribute('id', 'help-box');

    div.innerHTML = '<p>Press &lt;space&gt; to pause/unpause.</p>';
    div.innerHTML += '<p>Press &lt;n&gt; to step while paused.</p>';
    div.innerHTML += '<p>Press &lt;r&gt; to reset the simulation.</p>';

    document.body.appendChild(div);

    window.setTimeout(clear_help, 5000);
}


function on_key_press(event) {
    var key = String.fromCharCode(event.charCode);

    // space for pause/unpause
    if (key === ' ') {
        if (GLOBALS['interval_id']) {
            window.clearInterval(GLOBALS['interval_id']);
            GLOBALS['interval_id'] = null;
        } else {
            GLOBALS['interval_id'] = window.setInterval(run_sim,
                                                        GLOBALS['interval']);
        }

    // n for next step
    } else if (key === 'n') {
        run_sim();

    // r for reset
    } else if (key === 'r') {
        window.clearInterval(GLOBALS['interval_id']);
        init_sim();
        GLOBALS['interval_id'] = window.setInterval(run_sim,
                                                    GLOBALS['interval']);

    // ? for help
    } else if (key === '?') {
        show_help();
    }
}


window.onload = function () {
    GLOBALS['context'] = add_canvas();

    init_sim();
    GLOBALS['interval_id'] = window.setInterval(run_sim, GLOBALS['interval']);

    window.onkeypress = on_key_press;
};
