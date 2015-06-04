//
// Asymptotic series for large z:
//
template <class T>
struct erf_asympt_series_t
{
   erf_asympt_series_t(T z) : xx(2 * -z * z), tk(1)
   {
      BOOST_MATH_STD_USING
      result = -exp(-z * z) / sqrt(boost::math::constants::pi<T>());
      result /= z;
   }

   typedef T result_type;

   T operator()()
   {
      BOOST_MATH_STD_USING
      T r = result;
      result *= tk / xx;
      tk += 2;
      if( fabs(r) < fabs(result))
         result = 0;
      return r;
   }
private:
   T result;
   T xx;
   int tk;
};
//
// How large z has to be in order to ensure that the series converges:
//
template <class T>
inline float erf_asymptotic_limit_N(const T&)
{
   return (std::numeric_limits<float>::max)();
}
inline float erf_asymptotic_limit_N(const mpl::int_<24>&)
{
   return 2.8F;
}
inline float erf_asymptotic_limit_N(const mpl::int_<53>&)
{
   return 4.3F;
}
inline float erf_asymptotic_limit_N(const mpl::int_<64>&)
{
   return 4.8F;
}
inline float erf_asymptotic_limit_N(const mpl::int_<106>&)
{
   return 6.5F;
}
inline float erf_asymptotic_limit_N(const mpl::int_<113>&)
{
   return 6.8F;
}

template <class T, class Policy>
inline T erf_asymptotic_limit()
{
   typedef typename policies::precision<T, Policy>::type precision_type;
   typedef typename mpl::if_<
      mpl::less_equal<precision_type, mpl::int_<24> >,
      typename mpl::if_<
         mpl::less_equal<precision_type, mpl::int_<0> >,
         mpl::int_<0>,
         mpl::int_<24>
      >::type,
      typename mpl::if_<
         mpl::less_equal<precision_type, mpl::int_<53> >,
         mpl::int_<53>,
         typename mpl::if_<
            mpl::less_equal<precision_type, mpl::int_<64> >,
            mpl::int_<64>,
            typename mpl::if_<
               mpl::less_equal<precision_type, mpl::int_<106> >,
               mpl::int_<106>,
               typename mpl::if_<
                  mpl::less_equal<precision_type, mpl::int_<113> >,
                  mpl::int_<113>,
                  mpl::int_<0>
               >::type
            >::type
         >::type
      >::type
   >::type tag_type;
   return erf_asymptotic_limit_N(tag_type());
}

double erf_imp(double z)
{

   if(z < 0)
   {
		 return -erf_imp(-z);
   }

   double result;

   if(z > detail::erf_asymptotic_limit<T, Policy>())
   {
      detail::erf_asympt_series_t<T> s(z);
      boost::uintmax_t max_iter = policies::get_max_series_iterations<Policy>();
      result = boost::math::tools::sum_series(s, policies::get_epsilon<T, Policy>(), max_iter, 1);
      policies::check_series_iterations("boost::math::erf<%1%>(%1%, %1%)", max_iter, pol);
   }
   else
   {
      T x = z * z;
      if(x < 0.6)
      {
         // Compute P:
         result = z * exp(-x);
         result /= sqrt(boost::math::constants::pi<T>());
         if(result != 0)
            result *= 2 * detail::lower_gamma_series(T(0.5f), x, pol);
      }
      else if(x < 1.1f)
      {
         // Compute Q:
         invert = !invert;
         result = tgamma_small_upper_part(T(0.5f), x, pol);
         result /= sqrt(boost::math::constants::pi<T>());
      }
      else
      {
         // Compute Q:
         invert = !invert;
         result = z * exp(-x);
         result /= sqrt(boost::math::constants::pi<T>());
         result *= upper_gamma_fraction(T(0.5f), x, policies::get_epsilon<T, Policy>());
      }
   }
   return result;
}


