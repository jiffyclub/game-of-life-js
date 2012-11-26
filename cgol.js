// make these multiples of CELL_SIZE
var CELL_SIZE = 10;
var CANVAS_WIDTH = window.innerWidth -
    (window.innerWidth % CELL_SIZE) + CELL_SIZE;
var CANVAS_HEIGHT = window.innerHeight -
    (window.innerHeight % CELL_SIZE) + CELL_SIZE;


// add canvas to the page
function add_canvas() {
    var canvas = document.createElement('canvas');
    canvas.setAttribute('id', 'cgol-canvas');
    canvas.setAttribute('width', CANVAS_WIDTH);
    canvas.setAttribute('height', CANVAS_HEIGHT);
    document.body.appendChild(canvas);

    return canvas.getContext('2d');
}


// Adapted from Javascript: The Good Parts by Douglas Crockford
function zeros() {
    var a, i, j, m, n, mat = [];

    m = CANVAS_HEIGHT / CELL_SIZE;
    n = CANVAS_WIDTH / CELL_SIZE;

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
                context.fillStyle = '#ddd';
            }

            from_top = i * CELL_SIZE;
            from_left = j * CELL_SIZE;
            context.fillRect(from_left, from_top, CELL_SIZE, CELL_SIZE);
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


function run_sim(context, cells) {
    update(cells);
    draw_cells(context, cells);
}


window.onload = function () {
    var context, cells, interval_id;

    context = add_canvas();
    cells = initialize_cells(zeros());
    interval_id = window.setInterval(run_sim, 200, context, cells);
};
