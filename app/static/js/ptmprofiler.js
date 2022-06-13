let enabled_resides = ["S", "T","Y"];
var ptmprofiler = {
    
    phosphosite : class{
        
        constructor(entry){
            this.entry = entry;
            this.data = [];

        }
        show_data(htmlclass, protein_agent){
            this.data = jQuery.getJSON('/api/phosphosite/'+this.entry, function(data) {
            var output = "<table class=\"table\"><thead><tr>";
            output += "<th scope=\"col\">tp</th>";
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
                    output += "<tr id = \"phosphosite-row-" + (residue_position - 1) +"\">";
                    output += "<td style=\"background-color:" + protein_agent.typtic_peptide_colors[protein_agent.get_tryptic_peptide_no(residue_position)] +"\">"+ protein_agent.get_tryptic_peptide_no(residue_position) + "</td>";
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
            document.getElementById("phosphosite-data").value = JSON.stringify(data);
            
        });

        
        }
        select_phosphosites_data(ltp, htp,protein_agent, sequence_viewer){
            var data = JSON.parse(document.getElementById("phosphosite-data").value);
            jQuery.each(data, function(key, value){
                var curresidue = value['ID'].charAt(0);
                var residue_position = value['ID'].substring(1);
                if(enabled_resides.includes(curresidue)){
                    if((value['HTP'] > htp) || (value['LTP'] > ltp)){
                        sequence_viewer.select_residue(value['ID'].substring(1) - 1);

                    }
                }
            });

        }

        filter_on_tryptic(filter, protein_agent, sequence_viewer){
            var data = JSON.parse(document.getElementById("phosphosite-data").value);
            var prev_peptide = 0;

            var tryptic_peptides = protein_agent.tryptic_peptides;
            tryptic_peptides.push(protein_agent.protein_length);

            for(let peptide in tryptic_peptides ){
                var ST_max = 0;
                var Y_max = 0;
                var peptide_position = tryptic_peptides[peptide];

                //Get max for current peptide
                jQuery.each(data, function(key, value){
                    var residue_position = value['ID'].substring(1);
                    var curresidue = value['ID'].charAt(0);

                    if((residue_position >= prev_peptide) && (residue_position < peptide_position)){
                        if(curresidue =='Y'){
                            if(Y_max < value['HTP']){
                                Y_max = value['HTP'];
                            }

                        }
                        else if(curresidue == 'S' || curresidue == 'T'){
                            if(ST_max < value['HTP']){
                                ST_max = value['HTP'];
                            }

                        }
                    }
                    else{
                        if(residue_position < peptide_position){
                        return;
                        }
                    }
                });

                    //Loop again but make deselections
                    var Y_filter = filter * Y_max;
                    var ST_filter = filter * ST_max;

                    jQuery.each(data, function(key, value){
                        var residue_position = value['ID'].substring(1);
                        var curresidue = value['ID'].charAt(0);
    
                        if(residue_position >= prev_peptide && residue_position < peptide_position){
                            if(curresidue == 'Y'){
                                if(Y_filter > value['HTP']){
                                    sequence_viewer.deselect_residue(residue_position - 1);
                                }
    
                            }
                            else if(curresidue == 'S' || curresidue == 'T'){
                                if(ST_filter > value['HTP']){
                                    sequence_viewer.deselect_residue(residue_position - 1);
                                }
    
                            }
                        }
                        else{
                            if(residue_position < peptide_position){
                            return;
                            }
                        }


                });

                prev_peptide = peptide_position;
            }

        }
    },

    protein_agent : class{
        constructor(entry_object, settings){
            this.entry = entry_object['entry'];
            this.sequence = entry_object['sequence'];
            this.protein_length = this.sequence.length;
            this.selected = new Array(this.protein_length);
            this.selected.fill(false);
            this.tryptic_peptides = this.get_tryptic_peptides();
            this.typtic_peptide_colors = this.get_tryptic_peptide_colors();
            this.phosphosite = null;
    
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

        get_tryptic_peptides(){
            var tryptic_peptides;
            $.ajax({
                url: '/api/proteincutter/trypsin/'+this.sequence,
                async: false,
                dataType: 'json',
                success: function(data) {;
                    tryptic_peptides = data;
                    
                }
            });
            return tryptic_peptides;

        }

        get_tryptic_peptide_no(position_no){
            if(this.tryptic_peptides[0] > position_no ){
                return 1;

            }
            for(var i=0; i < this.tryptic_peptides.length; i++){
                if(position_no < this.tryptic_peptides[i]){
                    return i + 1;
                }

            }
            return this.tryptic_peptides.length + 1;

        }
        get_tryptic_peptide_colors(){
            var colors = [];
            for(var i = 0; i < this.tryptic_peptides.length; i++){
                colors.push('#' + Math.floor(Math.random()*16777215).toString(16));

            }
            colors.push(colors.push('#' + Math.floor(Math.random()*16777215).toString(16)));
            return colors;
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
                if(document.getElementById('phosphosite-row-' + residue_number)){
                    document.getElementById('phosphosite-row-' + residue_number).style = "background-color: #DDDDDD";

                }
            }
            else{
                document.getElementById('seq-view-res-'+residue_number).style = "background-color: none";
                if(document.getElementById('phosphosite-row-' + residue_number)){
                    document.getElementById('phosphosite-row-' + residue_number).style = "background-color: none";

                }
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




