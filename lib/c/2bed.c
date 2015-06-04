/*
# Descriptions   : 
# Usage          : 
# Parameters	 : none
# Sample Input   : 
# Sample Output  : 
# Depedency      : none
# Temp File      : none
# Comments       : none
# See Also       : none
# Data           : 
# Template       : Last modified date 11/16/10
# Author         : setupX
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <limits.h>

#include "../format_bed.h"


int main(int argc, char *argv[]){
	FILE *fp;

	char file[MAX_FILE_NAME_SIZE];
	char tfile[MAX_FILE_NAME_SIZE];
	int ln,i,begin_i;
	FILE *fp1;
	char *token;
	BED *beds,tbed,*sbeds;
	int hit;
	int shit,si,sj;

	strcpy(tfile,argv[1]);
	strcpy(file,argv[2]);
	ln=read_bed_file(file,&beds);
	
	if ((fp1 = fopen(tfile, "r")) == NULL){
		fprintf(stderr, "Coudn't open file %s\n",tfile);
		return -1;
	}
	begin_i=0;
	i=0;
	hit=0;
	shit=0;
	while (read_bed_fp(fp1,&tbed)){
		if (begin_i>=ln){
			hit=0;
		}
		else{

			while (strcmp(tbed.chr,beds[begin_i].chr) == 1)
				begin_i++;
				
			if (strcmp(tbed.chr,beds[begin_i].chr) == -1){
				hit=0;
			}
			else{
				i=begin_i;
				hit=0;
				shit=0;
				while (1)
				{
//			printf("1--%s\t%d\t%d\t\n",beds[i].chr,beds[i].stt,beds[i].end);
//			printf("2--%s\t%d\t%d\t\n",tbed.chr,tbed.stt,tbed.end);
					if(strcmp(tbed.chr,beds[i].chr))
						break;
					if(tbed.end <= beds[i].stt)
						break;

					if(tbed.stt >= beds[i].end){
						if(begin_i == i)
							begin_i++;
						i++;
						continue;
					}


					hit++;

					if(tbed.stt >= beds[i].stt && tbed.end <= beds[i].end){
						shit=0;
						break;
					}

					if(shit==0){
						// shit 0
						sbeds = 
							(BED *)realloc(sbeds, sizeof(BED));
						bedcpy(&sbeds[0],&tbed);
						shit++;

						if(tbed.stt < beds[i].stt && tbed.end > beds[i].end){
//							fprintf(stderr,"xxxx\n");
							sbeds = 
								(BED *)realloc(sbeds, 2*sizeof(BED));
							bedcpy(&sbeds[1],&tbed);
							shit++;
							sbeds[0].end = beds[i].stt;
							sbeds[1].stt = beds[i].end;
							i++;
							continue;
						}
						if(tbed.stt < beds[i].stt){
							sbeds[0].end = beds[i].stt;
							i++;
							continue;
						}
						if(tbed.end > beds[i].end){
							sbeds[0].stt = beds[i].end;
							i++;
							continue;
						}

					} //shit 0
					else{
						//shit more than 0
						for(si=0; si<shit; si++){
		//						fprintf(stderr,"a%d\t%d\n",si,shit);
							if(beds[i].end <= sbeds[si].stt)
								break;
							if(beds[i].stt >= sbeds[si].end)
								continue;

							if(sbeds[si].stt >= beds[i].stt && sbeds[si].end <= beds[i].end){
							//delete
								for (sj=1; sj<shit; sj++){
									bedcpy(&sbeds[sj],&sbeds[sj-1]);
								}
								sbeds = 
									(BED *)realloc(sbeds, (shit-1)*sizeof(BED));
								shit--;
								si--;
								continue;
							}
							if(sbeds[si].stt < beds[i].stt && sbeds[si].end > beds[i].end){
							//insert
	//							fprintf(stderr,"b%d\t%d\t%d\n",si,shit,sbeds[si].stt);
								sbeds = 
									(BED *)realloc(sbeds, (shit+1)*sizeof(BED));
								for (sj=shit-1; sj>=si; sj--){
									bedcpy(&sbeds[sj+1],&sbeds[sj]);
								}
//								fprintf(stderr,"c%d\t%d\t%d\n",si,shit,sbeds[si].stt);
								sbeds[si].end = beds[i].stt;
								sbeds[si+1].stt = beds[i].end;
								shit++;
								si++;
								continue;
							}
							if(sbeds[si].stt < beds[i].stt){
								sbeds[si].end = beds[i].stt;
								continue;
							}
							if(sbeds[si].end > beds[i].end){
								sbeds[si].stt = beds[i].end;
								continue;
							}

						}
					}
//					fprintf(stderr,"d%d\t%d\n",si,shit);

					//			printf("%s\t%s\n",tbed.name,beds[i].name);
					i++;
					continue;
				}
			}
		}
		if (hit==0)
			write_bed(&tbed);
		//		/*	
		else{ 
			for (si=0; si<shit; si++)
				write_bed(&sbeds[si]);
		}



		//			*/
	}
	fclose(fp1);
	return 1;
}
