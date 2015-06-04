/*
# Template       : Last modified data 02/20/12
# Author         : SetupX
 */

#ifndef _format
#define _format

#include <iostream>
#include <string>
#include <vector>
#include <fstream>
#include <sstream>
#include <map>
#include <algorithm>
#include <math.h>
using namespace std;

class _range{
	public:
		int stt;
		int end;
};
class _chr{
	public:
		string chr;
};
class _strd{
	public:
		char strd;
};
class _name{
	public:
		string name;
};
class _score{
	public:
		int score;
};

class sub_pos: public _range, public _name, public _score{
	public:
	inline sub_pos& join();
};



class pos : public sub_pos, public _chr, public _strd{
	public:

		inline void read(string str, const char delim='\t'){
			istringstream ss(str);
			string field;
			getline(ss, chr, delim);
			getline(ss, field, delim);
			stt = atoi(field.c_str());
			getline(ss, field, delim);
			end = atoi(field.c_str());
			getline(ss, name, delim);
			getline(ss, field, delim);
			score = atoi(field.c_str());
			getline(ss,field,delim);
			strd=field.c_str()[0];
		}
		inline string str(const char delim='\t') const
		{
			stringstream ss;
			ss<<chr<<delim<<stt<<delim<<end<<delim
				<<name<<delim<<score<<delim<<strd;
			return ss.str();
		}
		bool compare_by_pos(const pos &pos2) const
		{
			switch (chr.compare(pos2.chr)){
				case 1: return 1;
				case -1: return 0;
				case 0: 
					if (stt > pos2.stt)
						return 1;
					else if (stt < pos2.stt)
						return 0;
					else if (end > pos2.end)
						return 1;
					else if (end < pos2.end)
						return 0;
					else if (strd > pos2.strd)
						return 1;
					else if (strd < pos2.strd)
						return 0;
					else switch (name.compare(pos2.name)){
						case 1: return 1;
						case -1: return 0;
						case 0:
							return score > pos2.score ? 1 : 0;
					}
			}
		}
};

struct _pos_compare1{
	bool operator() (const pos& pos1, const pos& pos2) 
	{
		return pos2.compare_by_pos(pos1);
	}
} pos_compare1;

class bed
{
	public:
		vector<pos> vpos;

		inline int add(string file){
			string str;
			int ln=0;
			pos cpos;
			ifstream ii(file.c_str());
			while(getline(ii,str)){
				cpos.read(str);
				vpos.push_back(cpos);
				ln++;
			}
			return ln;
			ii.close();
		}

		inline int write(string file)
		{
			vector<pos>::iterator ipos;
			ofstream oo(file.c_str());
			for (ipos=vpos.begin(); ipos!=vpos.end(); ++ipos)
				oo << ipos->str() << endl;
			oo.close();
		}

		inline void sort_by_pos()
		{
			sort (vpos.begin(), vpos.end(), pos_compare1);
		}
};
class subbed
{
	public:
		vector<pos> vpos;
};
#endif
