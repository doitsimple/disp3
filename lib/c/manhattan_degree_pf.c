/* **************************************
 *
 * setupx degree
 *
 * **************************************/


#include "../../../C/io.h"
#include "../../../C/statistics.h"



int main (int argc, char *argv[]) {
	char input_file[MAX_FILE_NAME_LENGTH]; 
	NUM stt,end,step,cstt;
	int inum;
	FILE *fp;
	COUNT row_num, col_num, dim, pf_i, pf_i2,i,j;
	NUM pcc;
	NUM_PF *pcc_pfs;
	COUNT_PF *cut_pfs;

	if (argc < 2) {
		fprintf(stderr, 
			"Usage: pcc input_file pcc_threshold\n"); 
		exit(0); 
	}
	strcpy(input_file, argv[1]);
	stt = atof(argv[2]);
	end = atof(argv[3]);
	step = atof(argv[4]);
	
	inum =(int) ( (end-stt)/step + 1e-9);
	
	wc(input_file, &row_num, &col_num);

	cut_pfs = 
		( COUNT_PF* )malloc( row_num * sizeof(COUNT_PF) );


	if ((fp = fopen(input_file, "r")) == NULL) {
		fprintf(stderr, "Fail to open file %s!\n", input_file);
		return -1;
	}

	read_num_pfs(fp, row_num, col_num, &pcc_pfs); 
	fclose (fp); 

	for(i=0; i<row_num; i++){
		(cut_pfs+i)->pf = 
			( COUNT* )malloc( inum * sizeof(COUNT) );
		for(j=0; j<inum; j++)
			(cut_pfs+i)->pf[j]=0; 
		strcpy( (cut_pfs+i)->name, (pcc_pfs+i)->name);
	}
	dim=col_num-1;
	for (pf_i=0; pf_i<row_num; pf_i++)
		Z_transform (&(pcc_pfs + pf_i)->pf, dim); 

	for (pf_i = 0; pf_i < row_num; pf_i ++) {
		for (pf_i2 = pf_i+1; pf_i2<row_num; pf_i2++) {
			pcc  = inner_prod( (pcc_pfs + pf_i)->pf,  
				(pcc_pfs + pf_i2)->pf, dim ) / (dim-1);
			for(i=0; i<inum; i++){
				cstt=stt+step*(NUM)i;
				if (pcc >= cstt){
					cut_pfs[pf_i].pf[i]++;
					cut_pfs[pf_i2].pf[i]++;
				}
			}
		}
	}
	free(pcc_pfs);

	for(i=0; i<inum; i++){
		cstt=stt+step*(NUM)i;
		printf("\t%f",cstt);
	}
	printf("\n");
	write_count_pfs(stdout,row_num,inum,cut_pfs);
	
	return 0; 
}
