/* **************************************
 * by setupx
 * **************************************/


#include "../../../C/io.h"
#include "../../../C/statistics.h"


int main (int argc, char *argv[]) {
	char input_file[MAX_FILE_NAME_LENGTH]; 
	NUM th;
	FILE *fp;
	COUNT row_num, col_num, dim, pf_i, pf_i2;
	NUM pcc;
	NUM_PF *pcc_pfs;

	if (argc < 3) {
		fprintf(stderr, 
			"Usage: pcc input_file pcc_threshold\n"); 
		fprintf(stderr, 
			"MAX_LINE_SIZE 50000\n"); 
		exit(0); 
	}
	strcpy(input_file, argv[1]);
	th = atof(argv[2]);
	
	wc(input_file, &row_num, &col_num);

	if ((fp = fopen(input_file, "r")) == NULL) {
		fprintf(stderr, "Fail to open file %s!\n", input_file);
		return -1;
	}
	read_num_pfs(fp, row_num, col_num, &pcc_pfs); 
	fclose (fp); 

	dim=col_num-1;
	for (pf_i=0; pf_i<row_num; pf_i++)
		Z_transform (&(pcc_pfs + pf_i)->pf, dim); 
	for (pf_i = 0; pf_i < row_num; pf_i ++) {
		for (pf_i2 = pf_i+1; pf_i2<row_num; pf_i2++) {
			pcc  = inner_prod( (pcc_pfs + pf_i)->pf,  
				(pcc_pfs + pf_i2)->pf, dim ) / (dim-1);
			if (pcc >= th) 
				printf ("%s\t%s\t%f\n", (pcc_pfs + pf_i)->name, 
					(pcc_pfs + pf_i2)->name, pcc); 
		}
	}
	return 0; 
}
