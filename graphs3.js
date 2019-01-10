function randomInt(lower,upper) {
    return Math.floor(Math.random()*(upper+1-lower))+lower;
};

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return [evt.clientX - rect.left,evt.clientY - rect.top];
};

function dist2(a,b) {
    return Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2);
};

function Graph(power) {
    // adjacencyMatrix has values 0: no edge
    // 1: edge
    // -1: unknown
    power = power || 0;
    this.createRandom(power);
//    this.adjacencyMatrix = new Array(power*power);
//    this.power = power;
};

Graph.prototype.degree = function(v) {
    var d=0;
    for (var i=0;i<this.power;i++) {
        if (this.getEdge(i,v)==1) {
            d++;
        }
    }
    return d;
};

Graph.prototype.generateDegreeSequence = function() {
    this.degreeSequence = new Array(this.power);
    for (var i=0;i<this.power;i++) {
        this.degreeSequence[i] = this.degree(i);
    }
}

Graph.prototype.isIsomorphic = function(g,partialIso) {
    if (partialIso.length==this.power) {
        return true;
    }
    if (this.power != g.power) {
        return false;
    }
    
    var v = partialIso.length;
    for (var u=0;u<this.power;u++) {
        //see if we can map v to u
        //check if the degrees match and if u is free to map to
        if (//this.degreeSequence[u]==this.degreeSequence[v] &&
            partialIso.indexOf(u)==-1) {
            //check that mapping v to u preserves edges
            var match = true;
            for (var i=0;i<partialIso.length && match;i++) {
                match = (this.getEdge(v,i) == g.getEdge(u,partialIso[i]));
            }
            if (!match) {
                continue;
            }
            partialIso.push(u);
            if (this.isIsomorphic(g,partialIso)) {
                return true;
            }
            partialIso.pop();
        }
    }
    
    return false;
};

Graph.prototype.index = function(i,j) {
    if (i >= this.power || j >= this.power) {
        return false;
    }
    return this.power*i+j;
};

Graph.prototype.coordinates = function(index) {
    if (index >= this.power*this.power) {
        return false;
    }
    var j = index % this.power;
    var i = (index-j)/this.power;
    return [i,j];
};

Graph.prototype.setEdge = function(i,j,e) {
//    if (i != j) {
        this.adjacencyMatrix[this.index(j,i)]=this.adjacencyMatrix[this.index(i,j)] = e;
//    }
};

Graph.prototype.getEdge = function(i,j) {
    return this.adjacencyMatrix[this.index(i,j)];
};

Graph.prototype.copy = function() {
    var g = new Graph(this.power);
    g.adjacencyMatrix = this.adjacencyMatrix.slice(0);
    return g;
};

// creates a random graph with power vertices and independent edge prob of 1/2
Graph.prototype.createRandom = function(power) {
    this.power = power || 5;
    this.adjacencyMatrix = new Array(this.power*this.power);
    for (var i = 0; i<power;i++) {
        for (var j=0;j<power;j++) {
            this.setEdge(i,j,randomInt(0,1));
        }
        this.setEdge(i,i,0);
    }
};

//swaps the vertices u and v
Graph.prototype.changeVertices = function(u,v) {
    for (var j=0; j<this.power;j++) {
        if (j!=u && j != v) {
            var tmp = this.getEdge(v,j);
            this.setEdge(v,j,this.getEdge(u,j));
            this.setEdge(u,j,tmp);
        }
        // now deal with the remaining edges
        // the (u,v) edge does not have to be changed by symmetry
        // it remains to swap the 'non-edges' (u,u) and (v,v)
        var tmp = this.getEdge(u,u);
        this.setEdge(u,u,this.getEdge(v,v));
        this.setEdge(v,v,tmp);
    }
};

//shuffles the vertices and adjusts the adjacency matrix
Graph.prototype.shuffle = function() {
    for (var v=0; v< this.power;v++) {
        this.changeVertices(v,randomInt(0,this.power-1));
    }
};

//delete vertex information
Graph.prototype.deleteVertexInfo = function(v) {
    for (var u=0; u< this.power;u++) {
        this.setEdge(u,v,-1);
    }
};

Graph.prototype.printMatrix = function() {
    str = "";
    for (var i=0;i<this.power;i++) {
        for (var j=0;j<this.power;j++) {
            str += " " + this.getEdge(i,j) + " , ";
        }
        str += "\n";
    }
    return str;
};

Graph.prototype.reset = function() {
    for (var i=0;i<this.power;i++) {
        for (var j=0;j<this.power;j++) {
            if (this.getEdge(i,j)==2) {
                this.setEdge(i,j,-1);
            }
        }
    }
};

function GraphUI(graph,size) {
    this.graph = graph;
    this.size = size;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = this.size;
    this.canvas.parent = this;
    this.centres = [];
  
    this.resize(this.size);
    
    this.lastClicked = -1;
    
    this.canvas.onclick = function(evt) {
        this.parent.click(evt);
    }
/*    this.R = this.size/2-12
    this.X = this.Y = this.size/2
    this.centres = []
    for (var i=0;i<graph.power;i++) {
        this.centres[i] = [this.X+Math.cos(i*2.0*Math.PI/this.graph.power)*this.R,this.Y+Math.sin(i*2.0*Math.PI/this.graph.power)*this.R];
    }
    this.r = Math.min(10,Math.floor(2.0*Math.PI*this.R/this.graph.power))
*/};

    //a function to deal with onclick events on the canvas
GraphUI.prototype.click = function(evt) {
 //   console.log(this)
    var mousePos = getMousePos(this.canvas, evt);
    // get nearest vertex (within radius)
    var vertex = this.getVertex(mousePos,1.0);
//    console.log(vertex);
//    console.log(this.lastClicked);
    if (vertex != -1 && this.lastClicked == vertex) {
        this.drawVertex(vertex,"black");
        this.lastClicked = -1;
    }
    else if (vertex != -1 && this.lastClicked == -1) {
        this.drawVertex(vertex,"red");
        this.lastClicked = vertex;
    }
    else if (vertex != -1 && this.lastClicked != -1) {
        if (this.graph.getEdge(vertex,this.lastClicked)==-1) {
            this.graph.setEdge(vertex,this.lastClicked,2);
        }
        else if (this.graph.getEdge(vertex,this.lastClicked)==2) {
            this.graph.setEdge(vertex,this.lastClicked,-1);
        }
        this.lastClicked = -1;
        this.draw();
    }
};


GraphUI.prototype.getVertex = function(pos,mistake) {
    mistake = mistake || 2.0;
    for (var i=0;i<this.graph.power;i++) {
        if (dist2(this.centres[i],pos)<this.r*this.r*mistake) {
            return i;
        }
    }
    return -1;
};


GraphUI.prototype.resize = function(newSize) {
    this.size = newSize;
    this.canvas.width = this.canvas.height = this.size;
    
    this.R = this.size/2-12;
    this.X = this.Y = this.size/2;
    for (var i=0;i<this.graph.power;i++) {
        this.centres[i] = [this.X+Math.cos(i*2.0*Math.PI/this.graph.power)*this.R,this.Y+Math.sin(i*2.0*Math.PI/this.graph.power)*this.R];
    }
    this.r = Math.min(10,Math.floor(2.0*Math.PI*this.R/this.graph.power));
    this.draw();
};

GraphUI.prototype.drawVertex = function(v,colour) {
    colour = colour || "black";
    var ctx = this.canvas.getContext("2d");
    ctx.strokeStyle = colour;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.centres[v][0],this.centres[v][1],this.r,0,2*Math.PI);
    ctx.stroke();
};

GraphUI.prototype.drawVertices = function() {
    for (var v=0;v<this.graph.power;v++){
        this.drawVertex(v);
    }
};

GraphUI.prototype.drawEdge = function(u,v) {
    var edge = this.graph.getEdge(u,v);
    var ctx = this.canvas.getContext("2d");
    if (edge==0) {
        return;
        ctx.strokeStyle = "red";
        ctx.lineWidth = 4;
    }
    if (edge == 1) {
        ctx.strokeStyle = "blue";
        ctx.lineWidth = 4;
    }
    if (edge == -1) {
        ctx.strokeStyle = "grey";
        ctx.lineWidth = 2;
    }
    if (edge == 2) {
        ctx.strokeStyle = "black";
        ctx.lineWidth = 4;
    }
    ctx.beginPath();
    ctx.moveTo(this.centres[u][0],this.centres[u][1]);
    ctx.lineTo(this.centres[v][0],this.centres[v][1]);
    ctx.stroke();
};

GraphUI.prototype.drawEdges = function() {
    for (var u=0;u<this.graph.power;u++) {
        for (var v=u+1;v<this.graph.power;v++) {
            this.drawEdge(u,v);
        }
    }
};

GraphUI.prototype.draw = function() {
    this.canvas.getContext("2d").clearRect(0,0,this.size,this.size);
    this.drawVertices();
    this.drawEdges();
};


function ReconstructionGame(power) {
    power = power || 5
    //construct a random graph
    this.graph = new Graph(power);
    this.power = power;
    this.graph.createRandom(power);
    //create the cards by copying
    this.cards = new Array(power);
    for (var i=0;i<this.power;i++) {
        //copy graph
        this.cards[i] = this.graph.copy();
        //delete vertex
        this.cards[i].deleteVertexInfo(i);
        //shuffle
        if (i!=0) {
            this.cards[i].shuffle();
        }
    }
    this.solution = new Graph(power);
    for (var i=0;i<this.power;i++) {
        for (var j=0;j<this.power;j++) {
            this.solution.setEdge(i,j,-1);
        }
        this.solution.setEdge(i,j,0);
    }
};

function ReconstructionGameUI(recGame,size,solveDiv,hintsDiv,solutionDiv) {
    this.hintsDiv = hintsDiv;
    this.solutionDiv = solutionDiv;
    this.solveDiv = solveDiv;
    this.size = size;
// to show the solution
    this.graphUI = new GraphUI(recGame.graph,this.size);
    this.solutionDiv.appendChild(this.graphUI.canvas);
    this.graphUI.draw();
    //show the hints
    this.cards = new Array(this.graphUI.graph.power);
    for (var i = 0;i<this.graphUI.graph.power;i++) {
        this.cards[i] = new GraphUI(recGame.cards[i],this.size);
        this.hintsDiv.appendChild(this.cards[i].canvas);
        this.cards[i].draw();
    }
    // show the solving area
    this.solvingGraph = new GraphUI(recGame.solution,this.size);
    this.yesNo = document.createElement("p");
    this.solveDiv.appendChild(this.yesNo);
    
    this.controls = document.createElement("div");
    //reset button
    this.resetButton = document.createElement("button");
    this.resetButton.appendChild(document.createTextNode("Reset"));
    this.resetSolvingGraph = function() {
        this.solvingGraph.graph.reset();
        this.solvingGraph.draw();
        this.solvingGraph.undo = [];
    }
    this.resetButton.onclick = this.resetSolvingGraph.bind(this);
    // copy button
    this.copyHintFn = function(i) {
        return function() {
            //console.log(this);
            //console.log(i);
            this.solvingGraph.graph = this.cards[i].graph.copy();
            this.solvingGraph.draw();
            };
    }
    this.copyHintButton = [];
    for (var i=0;i<this.graphUI.graph.power;i++) {
        this.copyHintButton[i] = document.createElement("button");
        this.copyHintButton[i].appendChild(document.createTextNode("Copy Hint "+i.toString()));
        this.copyHintButton[i].addEventListener('click',this.copyHintFn(i).bind(this));
        this.controls.appendChild(this.copyHintButton[i]);
    }
    //check solution
    this.checkSolution = function () {
        //turn the solutions 2s into 1s and -1s into 0s
        for (var i=0;i<this.solvingGraph.graph.power;i++) {
            for (var j=0;j<this.solvingGraph.graph.power;j++) {
                if (this.solvingGraph.graph.getEdge(i,j)==-1) {
                    this.solvingGraph.graph.setEdge(i,j,0);
                }
                if (this.solvingGraph.graph.getEdge(i,j)==2) {
                    this.solvingGraph.graph.setEdge(i,j,1);
                }
            }
        }
        //now check for isometry
        var isIso = this.graphUI.graph.isIsomorphic(this.solvingGraph.graph,[]);
        console.log(isIso);
        var str ="Unfortunately, this is not correct";
        if (isIso) {
            str = "Yes, you've solved it!";
        }
        this.yesNo.appendChild(document.createTextNode(str));
        
    }
    this.checkSolButton = document.createElement("button");
    this.checkSolButton.appendChild(document.createTextNode("Check"));
    this.checkSolButton.addEventListener('click',this.checkSolution.bind(this));
    
    this.controls.appendChild(this.checkSolButton);
    this.solveDiv.appendChild(this.solvingGraph.canvas);
    this.solveDiv.appendChild(this.controls);
};

ReconstructionGameUI.prototype.resize = function(newSize) {
    this.size = newSize;
    this.graphUI.resize(newSize);
    for (var i = 0;i<this.graphUI.graph.power;i++) {
        this.cards[i].resize(newSize);
    }
};

ReconstructionGameUI.prototype.reset = function() {
    for (var i=0;i<this.graphUI.graph.power;i++) {
        this.cards[i].graph.reset();
        this.cards[i].draw();
    }
};