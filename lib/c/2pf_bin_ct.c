/* **************************************
 * by setupX
 * **************************************/


#include "../../../C/io.h"
//#include "../../../C/statistics.h"

int custom_score(boolean *in1, boolean *in2, int len){
	int i;
	int sum=0;
	for (i = 0; i < len; i++){
		if(in1[i] != in2[i])
			sum--;
		else 
//			if(in1[i])
			sum++;
	}
	return sum;
}
int main (int argc, char *argv[]) {
	char input_file1[MAX_FILE_NAME_LENGTH]; 
	char input_file2[MAX_FILE_NAME_LENGTH]; 
	double th;
	FILE *fp;
	COUNT row_num1, col_num1, dim1;
	COUNT row_num2, col_num2, dim2;
	COUNT pf_i, pf_i2;
	int score;
	BIN_PF *score_pfs1, *score_pfs2;

	if (argc < 4) {
		fprintf(stderr, 
			"Usage: score input_file1 input_file2 score_threshold\n"); 
		exit(0); 
	}
	strcpy(input_file1, argv[1]);
	strcpy(input_file2, argv[2]);
	th = atof(argv[3]);
	
	wc(input_file1, &row_num1, &col_num1);
	if ((fp = fopen(input_file1, "r")) == NULL) {
		fprintf(stderr, "Fail to open file %s!\n", input_file1);
		return -1;
	}
	read_bin_pfs(fp, row_num1, col_num1, &score_pfs1); 
	fclose (fp); 
	dim1=col_num1-1;

	wc(input_file2, &row_num2, &col_num2);
	if ((fp = fopen(input_file2, "r")) == NULL) {
		fprintf(stderr, "Fail to open file %s!\n", input_file2);
		return -1;
	}
	read_bin_pfs(fp, row_num2, col_num2, &score_pfs2); 
	fclose (fp); 
	dim2=col_num2-1;
	if(dim1 != dim2){
		fprintf(stderr,"Unequal dim!\n");
		return -1;
	}
	for (pf_i = 0; pf_i < row_num1; pf_i ++) {
		for (pf_i2 =0 ; pf_i2<row_num2; pf_i2++) {
			score  = custom_score( (score_pfs1 + pf_i)->pf,
				(score_pfs2 + pf_i2)->pf, dim1 );
			if(isnan(score))
				score = 0;
			if ((double)score >= th * (double)dim1)
				printf ("%s\t%s\t%f\n", (score_pfs1 + pf_i)->name,
					(score_pfs2 + pf_i2)->name, (double)score/(double)dim1);
		}
	}
	return 0; 
}
