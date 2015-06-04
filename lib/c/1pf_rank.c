/* **************************************
 * author:	setupx
 */


#include "../../../C/io.h"
#include "../../../C/statistics.h"


int main (int argc, char *argv[]) {
	char input_file1[MAX_FILE_NAME_LENGTH]; 
	COUNT i,len,th;
	FILE *fp;
	COUNT row_num1, col_num1, dim1;
	COUNT pf_i, pf_i2;
	NUM pcc,tmp_pcc,pre_cut;
	NUM_PF *pcc_pfs1;
	IJ2F *pccs;
	int min;

	if (argc < 3) {
		fprintf(stderr, 
			"Usage: pcc input_file1 input_file2 pcc_threshold\n"); 
		exit(0); 
	}
	strcpy(input_file1, argv[1]);
	th = atoi(argv[2]);
	pre_cut = atof(argv[3]);
	wc(input_file1, &row_num1, &col_num1);
	if ((fp = fopen(input_file1, "r")) == NULL) {
		fprintf(stderr, "Fail to open file %s!\n", input_file1);
		return -1;
	}
	read_num_pfs(fp, row_num1, col_num1, &pcc_pfs1); 
	fclose (fp); 
	dim1=col_num1-1;

	for (pf_i=0; pf_i<row_num1; pf_i++)
		Z_transform (&(pcc_pfs1 + pf_i)->pf, dim1); 
	pccs =
		(IJ2F *) malloc( 1e7 * sizeof(IJ2F) );
//	printf("memory allocated\n");
	len=0;
	for (pf_i = 0; pf_i < row_num1; pf_i ++) {
		for (pf_i2 = pf_i+1 ; pf_i2 < row_num1; pf_i2++) {
			pcc  = inner_prod( (pcc_pfs1 + pf_i)->pf,
				(pcc_pfs1 + pf_i2)->pf, dim1 ) / (dim1-1);
//			printf("%s\t%s\t%.3f\n",(pcc_pfs1+pf_i)->name,(pcc_pfs1+pf_i2)->name,pcc);
			if(pcc<pre_cut || isnan(pcc)){
				continue;
			}

			pccs[len].i=pf_i;
			pccs[len].j=pf_i2;
			pccs[len].f=pcc;
			len++;
		}
	}
	sort_ij2f_d(&pccs, len);
	if(th>len){
		fprintf(stderr,"pre_cut is too high\n");
		fprintf(stderr,"number of pairs with value more than pre_cut: %d\n",len);
	}
	min=MIN(th,len);
	for(i=0; i<min; i++){
		printf("%s\t%s\t%.3f\n",
				(pcc_pfs1+pccs[i].i)->name,
				(pcc_pfs1+pccs[i].j)->name,
				pccs[i].f);
	}
	return 0; 
}
