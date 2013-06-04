/*function pivotTable(dataFilePath) {

 this.rows = [];
 this.columns = [];
 this.dataFields = [];

 d3.csv(dataFilePath, function (csv) {
 this.data = d3.entries(csv).map(function (k) {
 return k.value;
 });
 });
 }*/

/*
 var incomeExpenseTable = new pivotTable("../data/tableData.csv");
 */

function renderPivotTable(data, rows, columns, dataFields) {

    var table = d3.select("#pivotTableContainer");
    var header = table.append("div").attr("id", "tableHeader");
    var tableBody = table.append("div").attr("id", "tableBody");

    var groupDataFunction = d3.nest();

    rows.forEach(function (r) {
        groupDataFunction.key(function (d) {
            return d[r];
        })
    });

    columns.forEach(function (c) {
        groupDataFunction.key(function (d) {
            return d[c];
        })
    });

    var groupedData = groupDataFunction.entries(data);

    var w = 1120,
        h = 600,
        x = d3.scale.linear().range([0, w]),
        y = d3.scale.linear().range([0, h]);

    var vis = d3.select("#tableBody").append("div")
        .attr("class", "chart")
        .style("width", w + "px")
        .style("height", h + "px")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    var partitionFunction = d3.layout.partition()
        .children(function (d) {
            return d.values;
        });


    var baseHeight = h / groupedData.length;
    var baseWidth = w / (dataFields.length + 1);

    groupedData.forEach(function (gd, dataIndex) {

        var partitionedData = partitionFunction.nodes(gd);
        console.log(partitionedData);
        var maxDepth = 0;
        partitionedData.forEach(function (pd) {
            if (pd.depth > maxDepth) {
                maxDepth = pd.depth;
            }
            if (pd.parent) {
                pd.height = pd.parent.height / pd.parent.children.length;
                pd.width = pd.parent.width * 0.5;
                pd.x = pd.parent.x + pd.width;
                pd.y = pd.height * pd.parent.children.indexOf(pd) + pd.parent.y;
            }
            else {
                pd.height = baseHeight;
                pd.width = baseWidth;
                pd.x = 0;
                pd.y = pd.height * dataIndex;
            }
        });


        var g = vis.selectAll("circle")
            .data(partitionedData)
            .enter().append("svg:g")
            .attr("y", baseHeight * dataIndex)
//            .attr("transform", function (d) {
//                if(d.depth===0){
//                    return "translate(" + x(d.y) + "," + y(dataIndex / groupedData.length) + ")";
//                }
//            });


        g.filter(function (d) {
            return d.key !== undefined;
        })
            .append("svg:rect")
            .attr("x", function (d) {
                return d.x;
            })
            .attr("y", function (d) {
                return d.y;
            })
            .attr("width", function (d) {
                return d.width;
            })
            .attr("height", function (d) {
                return d.height;
            })
            .attr("class", function (d) {
                var result = Array.isArray(d.values) ? "parent " : "child";
                result = result + " " + d.key;
                return result;
            })

        /*  .on("click", function (d) {
         click(d, "")
         });*/

        g.filter(function (d) {
            return d.key !== undefined;
        })
            .append("svg:text")
            .attr("dx", function (d) {
                return d.x + 8;
            })
            .attr("dy", function (d) {
                return d.y + d.height * 0.5;
            })
            .text(function (d) {
                return d.key;
            });

        dataFields.forEach(function (df, i) {

            g.append("svg:rect")
                .attr("width", baseWidth)
                .attr("height", function (d) {
                    return d.height;
                })
                .attr("class", function (d) {
                    if (d.key) {
                        return clearSpace(d.key) + " total";
                    }
                })
                .attr("x", baseWidth + (i) * baseWidth)
                .attr("y", function(d){
                    return d.y;
                })
                .attr("visibility", function(d){
                    if (d.depth === maxDepth - 1) {
                        return "visible";
                    }
                    else {
                        return "hidden";
                    }
                });

            g.append("svg:text")
                .attr("dx",1.5*baseWidth + (i) * baseWidth)
                .attr("dy",function(d){
                    return d.y+ d.height*0.5;
                })
                .text(function (d) {
                    if (d.values) {
                        return d3.sum(d.values, function (childNode) {
                            return parseFloat(childNode[df]);
                        });
                    }
                    else return d[df];
                })
                .attr("class", function (d) {
                    if (d.key) {
                        return clearSpace(d.key) + " total";
                    }
                })
                .attr("visibility", function (d) {
                    if (d.depth === maxDepth - 1) {
                        return "visible";
                    }
                    else {
                        return "hidden";
                    }
                });
        });

    });
}

function clearSpace(name) {
    return name.replace(/\s/g, "");
}

d3.csv("../data/tableData.csv", function (csv) {
    var rowData = d3.entries(csv).map(function (k) {
        return k.value;
    });

    renderPivotTable(rowData, ["Gender", "Education", "City"], [], ["Annual Purchases", "Income"]);
//    renderPivotTable(rowData, ["Gender"], [], ["Annual Purchases","Income"]);
});





