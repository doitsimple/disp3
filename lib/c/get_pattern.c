#include <stdio.h> 
#include <stdlib.h>
#include <string.h>
#include <math.h>
//#define PATH "/home/func/hg18/chromFa/"
#define PATH "/home/zyp/db/data/chr_seq/ori_seq/"

#define MAX_CHR_LENGTH 300000000
#define MAX_LINE_LENGTH 50
#define MAX_LINE_NUM MAX_CHR_LENGTH/MAX_LINE_LENGTH

#define MAX_ORF_NAME 400
#define MAX_CONTEXT_LEN 20
#define COL_TO_READ 3
char context[MAX_CONTEXT_LEN];
int context_len;
char palindromic;
char rev(char nt){
	if (nt=='A')
		return 'T';
	if (nt=='C')
		return 'G';
	if (nt=='G')
		return 'C';
	if (nt=='T')
		return 'A';
	if (nt=='N')
		return 'N';
	if (nt=='a')
		return 't';
	if (nt=='c')
		return 'g';
	if (nt=='g')
		return 'c';
	if (nt=='t')
		return 'a';
}
char is_palindromic(){
	int i;
	for(i=0; i<context_len; i++)
		if(context[i] != rev(context[context_len-i-1]))
			return 0;
	return 1;
}
char cmp_nt(char **chr, int i, char tnt){
	int m, new_pos;
	char nt;
	m = (int) i/MAX_LINE_LENGTH ; 
	new_pos = i - m * MAX_LINE_LENGTH; 
	nt = toupper(chr[m][new_pos]);
	if(nt == tnt)
		return '+';
	if(rev(nt) == tnt)
		return '-';
	return 0;	
}
int main (int argc, char *argv[]) { 

	if (argc < 1) { 
		printf ("Please specify input file\n"); 
		return (0);
	}
	int i,j,k,l,m;
	int start_pos,end_pos,new_pos;
	char strand,nt;
	char current_chr[12]="chr";
	char in_file[100],chr_file[100];	//file name
	int row_num, col_num; 
	char row[80],row2[80],*token; //for reading file
	char ***in, **chr; //for store input file and chrom file
	char mark[4]; //>
	char res;
	int count;
	char flag;
	char org[100];
	strcpy(mark, ">");

	FILE *IN,*fp;

	//count col number and row number of the input file
	strcpy(in_file,argv[1]);
	strcpy(context,argv[2]);
	context_len=atoi(argv[3]);
	strcpy(org,argv[4]);
//	palindromic=is_palindromic();
//	printf("palindromic is %d\n",palindromic);
	if ((IN = fopen(in_file, "r")) == NULL) {
		printf("can't open %s",in_file);
		return -1;
	}

	row_num=0;
	while (fgets(row, sizeof(row), IN) != NULL) {

		col_num=0;

		if(token = strtok(row,"\t")){;
			col_num++;
		}
		while ( (token = strtok(NULL, "\t")) != NULL ) {
			col_num++;
			//			printf("%s\n",token);
		}
		row_num++;
	}
	fclose(IN);

	//	printf("%d,%d\n",row_num,col_num);

	//malloc memory space accoding to col and row num
	in=(char ***) malloc(row_num * sizeof(char **));
	for(i=0;i<row_num;i++){
		in[i]=(char **) malloc(col_num * sizeof(char *));
	}
	//read input file 
	if ((IN = fopen(argv[1], "r")) == NULL) {
		printf("can't open %s",in_file);
		return -1;
	}
	row_num=0;
	while (fgets(row, sizeof(row), IN) != NULL) {
		col_num=0;
		if(token = strtok(row,"\t") ){
			in[row_num][col_num] =(char *)malloc(12*sizeof(char));
			strcpy(in[row_num][col_num], token);
			col_num++;
		}
		while ( (token = strtok(NULL, "\t")) != NULL ) {
			in[row_num][col_num] =(char *)malloc(12*sizeof(char));
			strcpy(in[row_num][col_num], token);
			col_num++;
			if(col_num>=COL_TO_READ)
				break;
		}
		row_num++;
	}

	fclose(IN);

	//	printf("%s,%s\n",in[0][1],in[1][1]);
	//find the rows belong to the same chromsome
	chr=(char **) malloc(MAX_LINE_NUM * sizeof(char*));
	for(i=0; i<MAX_LINE_NUM; i++)
		chr[i] = (char *) malloc(MAX_LINE_LENGTH +1 * sizeof(char));

	for(j=0; j<=row_num-1; j++){
		if(strcmp(current_chr,in[j][0]) != 0){
			strcpy(current_chr,in[j][0]);
			strcpy(chr_file, PATH); 
			strcat(chr_file, org); 
			strcat(chr_file, "/"); 
			strcat(chr_file, current_chr); 
			strcat(chr_file, ".fa"); 
			//read chromsome
			if ((fp = fopen(chr_file, "r")) == NULL) { 
				printf ("cannot open chr_file %s\n", chr_file); 
				return (-1); 
			} 

			k = 0; 

			while (fgets(row2, sizeof(row2), fp) != NULL) { 
				token = strtok(row2, "\n"); 

				if (token == NULL) {continue;}
				if (k > 0) {
					strcpy(chr[k - 1], token); 
				}
				k++;

			}
			fclose(fp); 
		}
//print result to STDOUT
		start_pos=atoi(in[j][1]);
		end_pos=atoi(in[j][2]);
		count=0;
		for (i = start_pos; i < end_pos; i ++) { 
/*			m = (int) i/MAX_LINE_LENGTH ; 
			new_pos = i - m * MAX_LINE_LENGTH; 
			nt = toupper(chr[m][new_pos]);
			printf("%c",nt);
*/			
			res= cmp_nt(chr,i,context[0]);
			if(res == 0)
				continue;
			flag=0;	
			if(res == '+'){
				for(l=1; l<context_len; l++)
					if(cmp_nt(chr,i+l,context[l]) != '+'){
						flag=1;
						break;
					}
				if(flag)	
					continue;
			}
			if(res == '-'){
				for(l=1; l<context_len; l++)
					if(cmp_nt(chr,i-l,context[l]) != '-'){
						flag=1;
						break;
					}
				if(flag)
					continue;
			}
			count++;
		}
		printf("%d\n",count);
	}
	return 1; 
}
