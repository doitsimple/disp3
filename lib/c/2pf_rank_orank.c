/* **************************************
 * author:	setupx
 */


#include "../../../C/io.h"
#include "../../../C/statistics.h"


int main (int argc, char *argv[]) {
	char input_file1[MAX_FILE_NAME_LENGTH]; 
	char input_file2[MAX_FILE_NAME_LENGTH]; 
	COUNT i,len,th,len2;
	FILE *fp;
	COUNT row_num1, col_num1, dim1;
	COUNT row_num2, col_num2, dim2;
	COUNT pf_i, pf_i2;
	NUM pcc,tmp_pcc;
	NUM_PF *pcc_pfs1, *pcc_pfs2;
	IJ2F *pccs,*pccs2;
	NUM pre_cut;
	COUNT min;

	if (argc < 3) {
		fprintf(stderr, 
			"Usage: pcc input_file1 input_file2 pcc_threshold\n"); 
		exit(0); 
	}
	strcpy(input_file1, argv[1]);
	strcpy(input_file2, argv[2]);
	th = atoi(argv[3]);
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
	for (pf_i=0; pf_i<row_num1; pf_i++)
		Z_transform (&(pcc_pfs1 + pf_i)->pf, dim1); 
	for (pf_i=0; pf_i<row_num2; pf_i++)
		Z_transform (&(pcc_pfs2 + pf_i)->pf, dim2); 
	pccs =
		(IJ2F *) malloc( INT_MAX * sizeof(IJ2F) );
	pccs2 =
		(IJ2F *) malloc( row_num2 * sizeof(IJ2F) );
//	printf("memory allocated\n");
	len=0;
	for (pf_i = 0; pf_i < row_num1; pf_i ++) {
		len2=0;
		for (pf_i2 =0 ; pf_i2<row_num2; pf_i2++) {
			pcc  = inner_prod( (pcc_pfs1 + pf_i)->pf,
				(pcc_pfs2 + pf_i2)->pf, dim1 ) / (dim1-1);
			if(isnan(pcc))
				pcc = 0;
			if(pcc>pre_cut){
				pccs2[len2].i=pf_i;
				pccs2[len2].j=pf_i2;
				pccs2[len2].f=pcc;
				len2++;
			}
		}
		sort_ij2f_d(&pccs2, len2);
		for (i=0; i<len2; i++){
			pccs[len].i=pccs2[i].i;
			pccs[len].j=pccs2[i].j;
			pccs[len].f=(double)(i+1);
			len++;
		}
	}
	sort_ij2f_i(&pccs, len);
	if(th>len){
		fprintf(stderr,"pre_cut is too high\n");
		fprintf(stderr,"number of pairs with value more than pre_cut: %d\n",len);
	}
	min=MIN(th,len);
	for(i=0; i<min; i++){
		printf("%s\t%s\t%.0f\n",
				(pcc_pfs1+pccs[i].i)->name,
				(pcc_pfs2+pccs[i].j)->name,
				pccs[i].f);
	}
	return 0; 
}
