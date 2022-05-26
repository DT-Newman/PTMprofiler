let enabled_resides = ["S", "T","Y"];
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

        select_all_S(){
            for(var i = 0; i < this.protein_length; i++){
                if(this.sequence.charAt(i) == "S"){
                    this.selected[i] = true;
                }
            }
        }
        select_all_T(){
            for(var i = 0; i < this.protein_length; i++){
                if(this.sequence.charAt(i) == "T"){
                    this.selected[i] = true;
                }
            }
        }
        select_all_Y(){
            for(var i = 0; i < this.protein_length; i++){
                if(this.sequence.charAt(i) == "Y"){
                    this.selected[i] = true;
                }
            }
        }
        residue_at_position(position){
            return this.sequence.charAt(position - 1);

        }


    },

    sequence_viewer: class{
        selectable_residues = enabled_resides;
        constructor(protein_agent, htmlclass, settings){
            this.sequence = protein_agent.sequence;
            this.residue_number = this.sequence.length;
            this.htmlclass = htmlclass;
    
    
        }



        select_all_S(){
            protein_agent.select_all_S();
            this.sequence_highlight();
        }
        select_all_T(){
            protein_agent.select_all_T();
            this.sequence_highlight();
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
            var text = "<button type=\"button\" class=\"btn btn-outline-secondary\" onclick=\"sequence_viewer.select_all_S()\">Select all S</button>";
            text += "<button type=\"button\" class=\"btn btn-outline-secondary\" onclick=\"sequence_viewer.select_all_T()\">Select all T</button>";
            text += "<button type=\"button\" class=\"btn btn-outline-secondary\" onclick=\"sequence_viewer.select_all_Y()\">Select all Y</button>";
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
    resmali: class{
        constructor(protein_agent, htmlclass){
            this.protein_agent = protein_agent;
            this.htmlclass = htmlclass;
            this.output = "";
        }
        draw_reSMALI(){
            var htmlclass = this.htmlclass;
            var output = "<table class=\"table\"><thead><tr>";
            output += "<th scope=\"col\">#</th>";
            output += "<th scope=\"col\">Prediction</th></tr></thead><tbody>";

            

            jQuery.getJSON('/api/resmali/condensed/'+protein_agent.sequence, function(data) {
                 jQuery.each(data, function(key, value){
                  if(protein_agent.selected[(parseInt(key))]){
                    output += "<tr>";
                    output += "<td>" + (parseInt(key) + 1) + "</td>";
                    output += "<td>" + value  + "</td></tr>";
                  }
                });
                output += "</tbody></table>";
                document.getElementById(htmlclass).innerHTML = output;
            });
        }

    },
    netphorest: class{
        constructor(protein_agent, htmlclass){
            this.protein_agent = protein_agent;
            this.htmlclass = htmlclass;
            this.netphorest = "";
        }
        get_netphorest(){
            var netphorest;

            $.ajax({
                url: '/api/netphorest/full/'+protein_agent.entry,
                async: false,
                dataType: 'json',
                success: function(data) {
                    netphorest = JSON.parse(data);
                    
                }
            });

            this.netphorest = netphorest;
       

        }
        draw_netphorest(type_list, min_score){
            var htmlclass = this.htmlclass;
            var protein_agent = this.protein_agent 
            var output = "<table class=\"table\"><thead><tr>";
            output += "<th scope=\"col\">#</th>";
            output += "<th scope=\"col\">Prediction</th>";
            output += "<th scope=\"col\">Type</th>";
            output += "<th scope=\"col\">Score</th></tr></thead><tbody>";
            jQuery.each(this.netphorest, function(key, value){
                if ((!type_list.includes(value['Type'])) || (value['Score'] < min_score) ) {
                    console.log(protein_agent.selected[value['Position']]);
                    return;
                }
                if( !protein_agent.selected[value['Position'] - 1 ]){
                    return;
                }

                output += "<tr>";
                output += "<td>" + value['Residue'] + value['Position'] + "</td>";
                output += "<td>" + value['Group'] + "</td>";
                output += "<td>" + value['Type'] + "</td>";
                output += "<td>" + value['Score']   + "</td></tr>";
              });




            output += "</tbody></table>";
            document.getElementById(htmlclass).innerHTML = output;

        }
    },

    networkin: class{
        constructor(protein_agent, htmlclass){
            this.protein_agent = protein_agent;
            this.htmlclass = htmlclass;
            this.networkin = "";
        }
        get_networkin(){
            var networkin;

            $.ajax({
                url: '/api/networkin/full/'+protein_agent.entry,
                async: false,
                dataType: 'json',
                success: function(data) {
                    networkin = JSON.parse(data);
                    
                }
            });

            this.networkin = networkin;
       

        }
        draw_networkin(type_list, min_score){
            var htmlclass = this.htmlclass;
            var protein_agent = this.protein_agent;
            var output = "<table class=\"table\"><thead><tr>";
            output += "<th scope=\"col\">#</th>";
            output += "<th scope=\"col\">Prediction</th>";
            output += "<th scope=\"col\">group</th>";
            output += "<th scope=\"col\">Type</th>";
            output += "<th scope=\"col\">Score</th></tr></thead><tbody>";
            jQuery.each(this.networkin, function(key, value){
                if ((!type_list.includes(value['tree'])) || (value['networkin_score'] < min_score) ) {
                    return;
                }
                if( !protein_agent.selected[value['position'] - 1 ]){
                    return;
                }

                output += "<tr>";
                output += "<td>"+ protein_agent.residue_at_position(value['position']) + value['position']+ "</td>";
                output += "<td>" + value['id']+ "</td>";
                output += "<td>" + value['netphorest_group'] + "</td>";
                output += "<td>" + value['tree'] + "</td>";
                output += "<td>" + value['networkin_score']   + "</td></tr>";
            
              });




            output += "</tbody></table>";
            document.getElementById(htmlclass).innerHTML = output;

        }
    }

}




