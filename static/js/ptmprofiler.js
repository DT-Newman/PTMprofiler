let enabled_resides = ["Y"];
var ptmprofiler = {
    
    phosphosite : class{
        
        constructor(entry){
            this.entry = entry;

        }
        show_data(htmlclass, protein_agent){
            
            jQuery.getJSON('/api/phosphosite/'+this.entry, function(data) {
            var output = "<table class=\"table\"><thead><tr>";
            output += "<th scope=\"col\">#</th>";
            output += "<th scope=\"col\">Sequence</th>";
            output += "<th scope=\"col\">Total</th>";
            output += "<th scope=\"col\">htp</th>";
            output += "<th scope=\"col\">ltp</th>";
            output += "<th scope=\"col\">Action</th></tr></thead><tbody>";
            console.log(data);
            jQuery.each(data, function(key, value){

                var curresidue = value['ID'].charAt(0);
                var residue_position = value['ID'].substring(1);

                if(enabled_resides.includes(curresidue)){
                    output += "<tr>";
                    output += "<th scope=\"row\">"+ value['ID'] + "</th>";
                    output += "<td>"+ value['NMER'] + "</td>";
                    output += "<td>"+ (value['HTP'] + value['LTP']) + "</td>";
                    output += "<td>"+ value['HTP'] + "</td>";
                    output += "<td>"+ value['LTP'] + "</td>"; 
                    output += "<td>" + " <button type=\"button\" class=\"btn btn-outline-success\""+ "onclick=\"sequence_viewer.select_residue("+ (residue_position-1) + ") \""  +">Select</button> <button type=\"button\" class=\"btn btn-outline-danger\"  "+ "onclick=\"sequence_viewer.deselect_residue("+ (residue_position-1) + ") \""  +">Remove</button>" + "</td></tr>";
                }
        
            });
            output += "</tbody></table>";
            document.getElementById("phosphosite-viewer").innerHTML = output;
        });
        }
    },

    protein_agent : class{
        constructor(entry_object, settings){
            this.entry = entry_object['entry'];
            this.sequence = entry_object['sequence'];
            this.protein_length = this.sequence.length;
            this.selected = new Array(this.protein_length);
            this.selected.fill(false)
    
        }


        select_all_Y(){
            for(var i = 0; i < this.protein_length; i++){
                if(this.sequence.charAt(i) == "Y"){
                    this.selected[i] = true;
                }
            }
        }


    },

    sequence_viewer: class{
        selectable_residues = ["Y"];
        constructor(protein_agent, htmlclass, settings){
            this.sequence = protein_agent.sequence;
            this.residue_number = this.sequence.length;
            this.htmlclass = htmlclass;
    
    
        }



        select_all_Y(){
            protein_agent.select_all_Y();
            this.sequence_highlight();

        }

        clear_all(){
            protein_agent.selected.fill(false);
            this.sequence_highlight();
        }

        toggle_residue(residue_number){
            protein_agent.selected[residue_number] = !protein_agent.selected[residue_number];
            this.highlight_residue(residue_number);

        }

        select_residue(residue_number){
            protein_agent.selected[residue_number] = true;
            this.highlight_residue(residue_number);

        }

        deselect_residue(residue_number){
            protein_agent.selected[residue_number] = false;
            this.highlight_residue(residue_number);

        }

        highlight_residue(residue_number){
            if (protein_agent.selected[residue_number]){
                document.getElementById('seq-view-res-'+residue_number).style = "background-color: red";
            }
            else{
                document.getElementById('seq-view-res-'+residue_number).style = "background-color: none";
            }
        }

        sequence_highlight(){
            for(var i = 0; i < this.sequence.length; i++){
                this.highlight_residue(i);
            }

        }

        draw(){
            var text = "<button type=\"button\" class=\"btn btn-outline-secondary\" onclick=\"sequence_viewer.select_all_Y()\">Select all Y</button>";
            text += " <button type=\"button\" class=\"btn btn-outline-danger\" onclick=\"sequence_viewer.clear_all()\">Clear all</button>";
            for (var i = 0; i < this.sequence.length; i++){ 
              text += "<a id=\"seq-view-res-" + i +"\" data-toggle=\"tooltip\"" + "title=\"" + this.sequence.charAt(i) + (i+1) + "\" "

              if(this.selectable_residues.includes(this.sequence.charAt(i))){
                  text += "onclick=\"sequence_viewer.toggle_residue("+ i + ") \""
              }
              
              text += ">" + this.sequence.charAt(i) + "</a>";
            }
            document.getElementById('sequence-viewer').innerHTML = text;
            document.getElementById('entry_name').innerHTML = entry_object['entry'];

        }

    },


}




