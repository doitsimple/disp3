/* **************************************
 * author:	setupx
 */


#include "../../../C/io.h"
#include "../../../C/statistics.h"


int main (int argc, char *argv[]) {
	char input_file1[MAX_FILE_NAME_LENGTH]; 
	char input_file2[MAX_FILE_NAME_LENGTH]; 
	COUNT i,len,th;
	FILE *fp;
	COUNT row_num1, col_num1, dim1;
	COUNT row_num2, col_num2, dim2;
	COUNT pf_i, pf_i2;
	NUM pcc,tmp_pcc;
	NUM_PF *pcc_pfs1, *pcc_pfs2;
	IJ2F *pccs;
	NUM pre_cut;
	COUNT min;
	NUM perc;

	if (argc < 3) {
		fprintf(stderr, 
			"Usage: pcc input_file1 input_file2 pcc_threshold\n"); 
		exit(0); 
	}
	strcpy(input_file1, argv[1]);
	strcpy(input_file2, argv[2]);
	perc = atof(argv[3]);
	pre_cut = atof(argv[4]);
	
	wc(input_file1, &row_num1, &col_num1);
	if ((fp = fopen(input_file1, "r")) == NULL) {
		fprintf(stderr, "Fail to open file %s!\n", input_file1);
		return -1;
	}
	read_num_pfs(fp, row_num1, col_num1, &pcc_pfs1); 
	fclose (fp); 
	dim1=col_num1-1;

	wc(input_file2, &row_num2, &col_num2);
	if ((fp = fopen(input_file2, "r")) == NULL) {
		fprintf(stderr, "Fail to open file %s!\n", input_file2);
		return -1;
	}
	read_num_pfs(fp, row_num2, col_num2, &pcc_pfs2); 
	fclose (fp); 
	dim2=col_num2-1;
	if(dim1 != dim2){
		fprintf(stderr,"Unequal dim!\n");
		return -1;
	}

	th = 
		perc * (NUM)row_num1 * (NUM)row_num2;

	for (pf_i=0; pf_i<row_num1; pf_i++)
		Z_transform (&(pcc_pfs1 + pf_i)->pf, dim1); 
	for (pf_i=0; pf_i<row_num2; pf_i++)
		Z_transform (&(pcc_pfs2 + pf_i)->pf, dim2); 
	pccs =
		(IJ2F *) malloc( INT_MAX * sizeof(IJ2F) );
//	printf("memory allocated\n");
	len=0;
	for (pf_i = 0; pf_i < row_num1; pf_i ++) {
		for (pf_i2 =0 ; pf_i2<row_num2; pf_i2++) {
			pcc  = inner_prod( (pcc_pfs1 + pf_i)->pf,
				(pcc_pfs2 + pf_i2)->pf, dim1 ) / (dim1-1);
			if(isnan(pcc))
				pcc = 0;
			if(pcc>pre_cut){
					pccs[len].i=pf_i;
					pccs[len].j=pf_i2;
					pccs[len].f=pcc;
					len++;
			}
		}
	}
	sort_ij2f_d(&pccs, len);
	if(th>len){
		fprintf(stderr,"pre_cut is too high\n");
		fprintf(stderr,"number of pairs with value more than pre_cut: %d\n",len);
		fprintf(stderr,"number of pairs within top %f: %d\n",perc, th);
	}
	min=MIN(th,len);
	for(i=0; i<min; i++){
		printf("%s\t%s\t%.3f\n",
				(pcc_pfs1+pccs[i].i)->name,
				(pcc_pfs2+pccs[i].j)->name,
				pccs[i].f);
	}
	return 0; 
}
